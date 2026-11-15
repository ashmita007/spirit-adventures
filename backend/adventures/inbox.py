"""
Owner-portal Inbox: read and reply to the business mailbox (info@spiritadventures.in)
from the website. Mail stays on the StackCP/20i server; this talks to it live over
IMAP (read) and SMTP (send), and files every sent reply into the mailbox's Sent folder
so it also shows up in webmail and phone mail apps.

All endpoints are staff only (same session + CSRF as the rest of /owner/).
"""
import email
import imaplib
import logging
import re
import time
from email import policy
from email.utils import formataddr, getaddresses, make_msgid, parsedate_to_datetime
from typing import List, Optional

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.http import HttpResponse
from ninja import Router, Schema
from ninja.errors import HttpError
from ninja.security import SessionAuthIsStaff

from .ratelimit import rate_limit

logger = logging.getLogger(__name__)
router = Router(auth=SessionAuthIsStaff(), tags=["Owner Inbox"])

PAGE_SIZE_MAX = 50
MAX_RECIPIENTS = 20
LIST_RE = re.compile(r'^\((?P<flags>[^)]*)\) (?:"(?P<delim>[^"]*)"|NIL) (?P<name>.+)$')


# ----------------------------------------------------------------- helpers
def _require_enabled():
    if not settings.MAIL_ENABLED:
        raise HttpError(503, "Email is not set up yet. Add MAIL_PASSWORD on the server to turn on the Inbox.")


def _q(name: str) -> str:
    """Quote a mailbox name for IMAP commands."""
    return '"' + name.replace("\\", "\\\\").replace('"', '\\"') + '"'


class _Imap:
    def __enter__(self):
        _require_enabled()
        try:
            self.conn = imaplib.IMAP4_SSL(settings.MAIL_IMAP_HOST, settings.MAIL_IMAP_PORT, timeout=20)
            self.conn.login(settings.MAIL_ADDRESS, settings.MAIL_PASSWORD)
        except imaplib.IMAP4.error as exc:
            logger.warning("IMAP login failed: %s", exc)
            raise HttpError(502, "Could not sign in to the mailbox. Check MAIL_ADDRESS / MAIL_PASSWORD.")
        except OSError as exc:
            logger.warning("IMAP connect failed: %s", exc)
            raise HttpError(502, "The mail server is not reachable right now. Try again in a minute.")
        return self.conn

    def __exit__(self, *exc):
        try:
            self.conn.logout()
        except Exception:
            pass
        return False


def _folders(conn) -> List[dict]:
    typ, data = conn.list()
    out = []
    for raw in data or []:
        if not raw:
            continue
        line = raw.decode(errors="replace") if isinstance(raw, bytes) else str(raw)
        m = LIST_RE.match(line)
        if not m:
            continue
        name = m.group("name").strip()
        if name.startswith('"') and name.endswith('"'):
            name = name[1:-1].replace('\\"', '"').replace("\\\\", "\\")
        flags = m.group("flags")
        if "\\Noselect" in flags:
            continue
        delim = m.group("delim") or "."
        label = name.split(delim)[-1] if delim else name
        role = next((r for r in ("Sent", "Drafts", "Trash", "Junk", "Archive") if f"\\{r}" in flags), None)
        if not role and label.lower() in {"sent", "sent items", "sent messages"}:
            role = "Sent"
        if not role and label.lower() in {"spam", "junk"}:
            role = "Junk"
        if not role and label.lower() in {"trash", "deleted items", "bin"}:
            role = "Trash"
        if name.upper() == "INBOX":
            role, label = "Inbox", "Inbox"
        out.append({"name": name, "label": label, "role": role})
    order = {"Inbox": 0, "Sent": 1, "Drafts": 2, "Junk": 3, "Trash": 4, "Archive": 5}
    out.sort(key=lambda f: (order.get(f["role"], 9), f["label"].lower()))
    return out


def _select(conn, folder: str, readonly=True) -> int:
    typ, data = conn.select(_q(folder), readonly=readonly)
    if typ != "OK":
        raise HttpError(404, "That folder does not exist.")
    return int(data[0] or 0)


def _addr_list(value) -> List[dict]:
    return [{"name": n, "email": a} for n, a in getaddresses([str(value or "")]) if a]


def _date_iso(value) -> Optional[str]:
    try:
        return parsedate_to_datetime(str(value)).isoformat() if value else None
    except Exception:
        return None


def _parse_fetch(data):
    """Pair up imaplib FETCH responses -> list of (meta_bytes, payload_bytes)."""
    out = []
    for item in data or []:
        if isinstance(item, tuple) and len(item) >= 2:
            out.append((item[0], item[1]))
    return out


def _uid_of(meta: bytes) -> Optional[int]:
    m = re.search(rb"UID (\d+)", meta)
    return int(m.group(1)) if m else None


def _clean_query(q: str) -> str:
    q = (q or "").strip()[:80]
    q = re.sub(r'["\\\r\n]', " ", q)
    return q if q.isascii() else ""


def _check_addresses(values: List[str], field: str) -> List[str]:
    clean = []
    for v in values:
        v = (v or "").strip()
        if not v:
            continue
        try:
            validate_email(v)
        except ValidationError:
            raise HttpError(400, f"'{v}' in {field} is not a valid email address.")
        clean.append(v)
    return clean


# ----------------------------------------------------------------- schemas
class SendIn(Schema):
    to: List[str]
    cc: List[str] = []
    subject: str
    body: str
    in_reply_to: Optional[str] = None
    references: Optional[str] = None


# ----------------------------------------------------------------- endpoints
@router.get("/status/")
def mail_status(request):
    return {"success": True, "data": {"enabled": settings.MAIL_ENABLED, "address": settings.MAIL_ADDRESS}}


@router.get("/folders/")
@rate_limit(max_requests=60, window_seconds=60, bucket_name="owner_mail_read")
def mail_folders(request):
    with _Imap() as conn:
        folders = _folders(conn)
        for f in folders:
            typ, data = conn.status(_q(f["name"]), "(UNSEEN MESSAGES)")
            m = re.search(rb"UNSEEN (\d+)", data[0] or b"") if typ == "OK" else None
            t = re.search(rb"MESSAGES (\d+)", data[0] or b"") if typ == "OK" else None
            f["unread"] = int(m.group(1)) if m else 0
            f["total"] = int(t.group(1)) if t else 0
    return {"success": True, "data": folders}


@router.get("/messages/")
@rate_limit(max_requests=60, window_seconds=60, bucket_name="owner_mail_read")
def mail_list(request, folder: str = "INBOX", page: int = 1, page_size: int = 25, q: str = ""):
    page = max(1, page)
    page_size = max(5, min(PAGE_SIZE_MAX, page_size))
    with _Imap() as conn:
        _select(conn, folder)
        query = _clean_query(q)
        if query:
            typ, data = conn.uid("SEARCH", None, "OR", "OR", "FROM", f'"{query}"', "SUBJECT", f'"{query}"', "TO", f'"{query}"')
        else:
            typ, data = conn.uid("SEARCH", None, "ALL")
        uids = [int(x) for x in (data[0] or b"").split()] if typ == "OK" else []
        uids.sort(reverse=True)
        total = len(uids)
        chunk = uids[(page - 1) * page_size: page * page_size]
        items = []
        if chunk:
            typ, data = conn.uid(
                "FETCH", ",".join(map(str, chunk)),
                "(UID FLAGS RFC822.SIZE BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)])",
            )
            for meta, payload in _parse_fetch(data):
                uid = _uid_of(meta)
                if uid is None:
                    continue
                hdr = email.message_from_bytes(payload, policy=policy.default)
                flags = re.search(rb"FLAGS \(([^)]*)\)", meta)
                flag_s = flags.group(1).decode() if flags else ""
                items.append({
                    "uid": uid,
                    "subject": str(hdr.get("Subject", "") or "(no subject)"),
                    "from": _addr_list(hdr.get("From")),
                    "to": _addr_list(hdr.get("To")),
                    "date": _date_iso(hdr.get("Date")),
                    "seen": "\\Seen" in flag_s,
                    "flagged": "\\Flagged" in flag_s,
                    "answered": "\\Answered" in flag_s,
                })
            items.sort(key=lambda m: m["uid"], reverse=True)
    return {"success": True, "data": {"items": items, "total": total, "page": page, "page_size": page_size}}


def _fetch_message(conn, folder: str, uid: int, mark_seen: bool):
    _select(conn, folder, readonly=not mark_seen)
    typ, data = conn.uid("FETCH", str(uid), "(UID FLAGS BODY.PEEK[])")
    parts = _parse_fetch(data)
    if typ != "OK" or not parts:
        raise HttpError(404, "Email not found. It may have been moved or deleted.")
    meta, raw = parts[0]
    if mark_seen:
        conn.uid("STORE", str(uid), "+FLAGS", "(\\Seen)")
    return meta, email.message_from_bytes(raw, policy=policy.default)


def _attachments(msg):
    out = []
    for idx, part in enumerate(msg.walk()):
        if part.is_multipart():
            continue
        disp = part.get_content_disposition()
        name = part.get_filename()
        if disp == "attachment" or (name and disp != "inline"):
            payload = part.get_payload(decode=True) or b""
            out.append({"index": idx, "filename": name or f"attachment-{idx}", "content_type": part.get_content_type(), "size": len(payload)})
    return out


@router.get("/messages/{uid}/")
@rate_limit(max_requests=120, window_seconds=60, bucket_name="owner_mail_read")
def mail_get(request, uid: int, folder: str = "INBOX"):
    with _Imap() as conn:
        meta, msg = _fetch_message(conn, folder, uid, mark_seen=True)
    text_part = msg.get_body(preferencelist=("plain",))
    html_part = msg.get_body(preferencelist=("html",))
    try:
        text = text_part.get_content() if text_part else ""
    except Exception:
        text = ""
    try:
        html = html_part.get_content() if html_part else ""
    except Exception:
        html = ""
    refs = " ".join(x for x in [str(msg.get("References", "") or ""), str(msg.get("Message-ID", "") or "")] if x).strip()
    return {"success": True, "data": {
        "uid": uid,
        "folder": folder,
        "subject": str(msg.get("Subject", "") or "(no subject)"),
        "from": _addr_list(msg.get("From")),
        "to": _addr_list(msg.get("To")),
        "cc": _addr_list(msg.get("Cc")),
        "reply_to": _addr_list(msg.get("Reply-To")),
        "date": _date_iso(msg.get("Date")),
        "message_id": str(msg.get("Message-ID", "") or ""),
        "references": refs,
        "text": text[:500_000],
        "html": html[:1_000_000],  # rendered by the portal in a sandboxed iframe (no scripts)
        "attachments": _attachments(msg),
    }}


@router.get("/messages/{uid}/attachments/{index}/")
@rate_limit(max_requests=60, window_seconds=60, bucket_name="owner_mail_read")
def mail_attachment(request, uid: int, index: int, folder: str = "INBOX"):
    with _Imap() as conn:
        _, msg = _fetch_message(conn, folder, uid, mark_seen=False)
    for idx, part in enumerate(msg.walk()):
        if idx == index and not part.is_multipart():
            payload = part.get_payload(decode=True) or b""
            name = re.sub(r'[^\w.\- ]', "_", part.get_filename() or f"attachment-{idx}")
            resp = HttpResponse(payload, content_type="application/octet-stream")
            resp["Content-Disposition"] = f'attachment; filename="{name}"'
            resp["X-Content-Type-Options"] = "nosniff"
            return resp
    raise HttpError(404, "Attachment not found.")


@router.post("/messages/{uid}/seen/")
def mail_mark(request, uid: int, folder: str = "INBOX", seen: bool = True):
    with _Imap() as conn:
        _select(conn, folder, readonly=False)
        conn.uid("STORE", str(uid), "+FLAGS" if seen else "-FLAGS", "(\\Seen)")
    return {"success": True, "data": None}


@router.post("/send/")
@rate_limit(max_requests=20, window_seconds=60, bucket_name="owner_mail_send")
def mail_send(request, payload: SendIn):
    _require_enabled()
    to = _check_addresses(payload.to, "To")
    cc = _check_addresses(payload.cc, "Cc")
    if not to:
        raise HttpError(400, "Add at least one email address in To.")
    if len(to) + len(cc) > MAX_RECIPIENTS:
        raise HttpError(400, f"Please send to at most {MAX_RECIPIENTS} people at once.")
    subject = re.sub(r"[\r\n]+", " ", payload.subject or "").strip()[:250]
    body = (payload.body or "").strip()
    if not subject:
        raise HttpError(400, "Please add a subject.")
    if not body:
        raise HttpError(400, "Please write a message.")
    if len(body) > 100_000:
        raise HttpError(400, "That message is too long.")

    headers = {"Message-ID": make_msgid(domain=settings.MAIL_ADDRESS.split("@")[-1])}
    safe = lambda v: re.sub(r"[\r\n]+", " ", v or "").strip()[:2000]  # noqa: E731
    if payload.in_reply_to:
        headers["In-Reply-To"] = safe(payload.in_reply_to)
        headers["References"] = safe(payload.references) or safe(payload.in_reply_to)

    sender = getattr(request.user, "get_full_name", lambda: "")() or ""
    signature = f"\n\n--\n{sender + chr(10) if sender else ''}{settings.MAIL_DISPLAY_NAME}\n{settings.MAIL_ADDRESS}"
    text = body + signature
    msg = EmailMultiAlternatives(subject, text, formataddr((settings.MAIL_DISPLAY_NAME, settings.MAIL_ADDRESS)),
                                 to, cc=cc, headers=headers)
    try:
        msg.send(fail_silently=False)
    except Exception as exc:
        logger.warning("SMTP send failed: %s", exc)
        raise HttpError(502, "The email could not be sent. Please try again in a minute.")

    # Keep a copy in Sent so it appears in webmail too (best effort).
    try:
        with _Imap() as conn:
            sent = next((f["name"] for f in _folders(conn) if f["role"] == "Sent"), None)
            if sent:
                conn.append(_q(sent), "(\\Seen)", imaplib.Time2Internaldate(time.time()), msg.message().as_bytes())
            if payload.in_reply_to:
                _select(conn, "INBOX", readonly=False)
                typ, data = conn.uid("SEARCH", None, "HEADER", "Message-ID", f'"{safe(payload.in_reply_to)}"')
                for u in (data[0] or b"").split() if typ == "OK" else []:
                    conn.uid("STORE", u.decode(), "+FLAGS", "(\\Answered)")
    except Exception:
        logger.exception("Could not file sent email into Sent folder")

    return {"success": True, "data": {"message_id": headers["Message-ID"]}, "message": "Email sent."}
