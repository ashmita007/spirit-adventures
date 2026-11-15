"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Inbox as InboxIcon, Send, FileText, Trash2, ShieldAlert, Archive, Folder, RefreshCw, Search,
  PenSquare, Reply, ReplyAll, Forward, ArrowLeft, Paperclip, X, ChevronLeft, ChevronRight, MailWarning, Loader2,
} from "lucide-react";
import { ownerFetch } from "@/lib/owner-fetch";
import { cn } from "@/lib/utils";

type Addr = { name: string; email: string };
type FolderT = { name: string; label: string; role: string | null; unread: number; total: number };
type ListItem = { uid: number; subject: string; from: Addr[]; to: Addr[]; date: string | null; seen: boolean; answered: boolean };
type Message = {
  uid: number; folder: string; subject: string; from: Addr[]; to: Addr[]; cc: Addr[]; reply_to: Addr[];
  date: string | null; message_id: string; references: string; text: string; html: string;
  attachments: { index: number; filename: string; content_type: string; size: number }[];
};
type Compose = { to: string; cc: string; subject: string; body: string; inReplyTo?: string; references?: string };

const BASE = "/api/v1/owner/mail";
const PAGE_SIZE = 25;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await ownerFetch(`${BASE}${path}`, { cache: "no-store", ...init });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || json.message || "Something went wrong.");
  return json.data as T;
}

const who = (a?: Addr[]) => (a && a[0] ? a[0].name || a[0].email : "Unknown");
const addrLine = (a: Addr[]) => a.map((x) => (x.name ? `${x.name} <${x.email}>` : x.email)).join(", ");
const splitAddrs = (s: string) => s.split(/[,;]/).map((x) => x.trim().replace(/^.*<([^>]+)>.*$/, "$1")).filter(Boolean);

function shortDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fullDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
}

function quote(m: Message) {
  const body = (m.text || m.html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+\n/g, "\n")).trim();
  return `\n\n\nOn ${fullDate(m.date)}, ${who(m.from)} wrote:\n` + body.split("\n").slice(0, 200).map((l) => `> ${l}`).join("\n");
}

const FOLDER_ICON: Record<string, React.ElementType> = { Inbox: InboxIcon, Sent: Send, Drafts: FileText, Trash: Trash2, Junk: ShieldAlert, Archive };

function EmailBody({ m }: { m: Message }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(400);
  const doc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">` +
      `<meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none'; frame-src 'none'">` +
      `<style>body{margin:0;font:14px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;word-wrap:break-word}img{max-width:100%;height:auto}table{max-width:100%}</style>` +
      `</head><body>${m.html}</body></html>`,
    [m.html],
  );
  if (!m.html) {
    return <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-800">{m.text || "(empty email)"}</pre>;
  }
  return (
    <iframe
      ref={ref}
      title="Email content"
      // No scripts ever run; same-origin only lets us measure the height.
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      srcDoc={doc}
      onLoad={() => {
        const b = ref.current?.contentDocument?.documentElement;
        if (b) setH(Math.min(Math.max(b.scrollHeight + 16, 200), 20000));
      }}
      style={{ height: h }}
      className="w-full border-0 bg-white"
    />
  );
}

export default function InboxClient({ composeTo, composeSubject }: { composeTo?: string; composeSubject?: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [address, setAddress] = useState("");
  const [folders, setFolders] = useState<FolderT[]>([]);
  const [folder, setFolder] = useState("INBOX");
  const [items, setItems] = useState<ListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openUid, setOpenUid] = useState<number | null>(null);
  const [msg, setMsg] = useState<Message | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [compose, setCompose] = useState<Compose | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    call<{ enabled: boolean; address: string }>("/status/")
      .then((s) => {
        setEnabled(s.enabled);
        setAddress(s.address);
      })
      .catch((e) => {
        setEnabled(false);
        setError(e.message);
      });
  }, []);

  useEffect(() => {
    if (composeTo) setCompose({ to: composeTo, cc: "", subject: composeSubject || "Your Spirit Adventures trip", body: "" });
  }, [composeTo, composeSubject]);

  const loadFolders = useCallback(() => {
    call<FolderT[]>("/folders/").then(setFolders).catch(() => undefined);
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = new URLSearchParams({ folder, page: String(page), page_size: String(PAGE_SIZE) });
      if (search) p.set("q", search);
      const d = await call<{ items: ListItem[]; total: number }>(`/messages/?${p}`);
      setItems(d.items);
      setTotal(d.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [folder, page, search]);

  useEffect(() => {
    if (!enabled) return;
    loadFolders();
  }, [enabled, loadFolders]);

  useEffect(() => {
    if (enabled) loadList();
  }, [enabled, loadList]);

  // Check for new mail every 2 minutes while the tab is open.
  useEffect(() => {
    if (!enabled) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadFolders();
        if (page === 1 && !search) loadList();
      }
    }, 120000);
    return () => window.clearInterval(t);
  }, [enabled, loadFolders, loadList, page, search]);

  const openMessage = async (uid: number) => {
    setOpenUid(uid);
    setMsg(null);
    setMsgLoading(true);
    try {
      const m = await call<Message>(`/messages/${uid}/?folder=${encodeURIComponent(folder)}`);
      setMsg(m);
      setItems((list) => list.map((i) => (i.uid === uid ? { ...i, seen: true } : i)));
      loadFolders();
    } catch (e) {
      setError((e as Error).message);
      setOpenUid(null);
    } finally {
      setMsgLoading(false);
    }
  };

  const reSubject = (s: string, prefix: "Re" | "Fwd") => (new RegExp(`^${prefix}:`, "i").test(s) ? s : `${prefix}: ${s}`);

  const reply = (all: boolean) => {
    if (!msg) return;
    const target = msg.reply_to.length ? msg.reply_to : msg.from;
    const me = address.toLowerCase();
    const cc = all ? [...msg.to, ...msg.cc].filter((a) => a.email.toLowerCase() !== me && !target.some((t) => t.email === a.email)) : [];
    setCompose({
      to: target.map((a) => a.email).join(", "),
      cc: cc.map((a) => a.email).join(", "),
      subject: reSubject(msg.subject, "Re"),
      body: quote(msg),
      inReplyTo: msg.message_id,
      references: msg.references,
    });
  };

  const forward = () => {
    if (!msg) return;
    const head = `\n\n---------- Forwarded message ----------\nFrom: ${addrLine(msg.from)}\nDate: ${fullDate(msg.date)}\nSubject: ${msg.subject}\nTo: ${addrLine(msg.to)}\n\n`;
    setCompose({ to: "", cc: "", subject: reSubject(msg.subject, "Fwd"), body: head + (msg.text || "").trim() });
  };

  const send = async () => {
    if (!compose) return;
    setSending(true);
    setSendError("");
    try {
      await call("/send/", {
        method: "POST",
        body: JSON.stringify({
          to: splitAddrs(compose.to),
          cc: splitAddrs(compose.cc),
          subject: compose.subject,
          body: compose.body,
          in_reply_to: compose.inReplyTo || null,
          references: compose.references || null,
        }),
      });
      setCompose(null);
      setToast("Email sent");
      window.setTimeout(() => setToast(""), 3000);
      loadFolders();
      if (folders.find((f) => f.name === folder)?.role === "Sent") loadList();
    } catch (e) {
      setSendError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isSentFolder = folders.find((f) => f.name === folder)?.role === "Sent";

  if (enabled === null) {
    return (
      <div className="p-8 flex justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <MailWarning className="w-6 h-6 text-amber-500" />
            <h1 className="text-lg font-bold text-slate-900">Inbox is not connected yet</h1>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            To read and reply to <b>{address || "info@spiritadventures.in"}</b> here, add the mailbox password on the server:
            Render dashboard → <b>spirit-adventures</b> → <b>Environment</b> → add <code className="px-1 bg-slate-100 rounded">MAIL_PASSWORD</code>, then save.
            New lead alert emails turn on at the same time.
          </p>
          {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
        </div>
      </div>
    );
  }

  const listPane = (
    <section className={cn("flex flex-col min-h-0 min-w-0 flex-1 lg:flex-none border-r border-slate-200 bg-white lg:w-[380px] lg:flex-shrink-0", openUid !== null && "hidden lg:flex")}>
      <div className="p-3 border-b border-slate-100 flex items-center gap-2">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or subject"
            aria-label="Search emails"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
          />
        </form>
        <button
          type="button"
          onClick={() => {
            loadFolders();
            loadList();
          }}
          aria-label="Refresh"
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {search && (
        <div className="px-3 py-2 text-xs text-slate-500 flex items-center justify-between bg-slate-50 border-b border-slate-100">
          <span>Results for “{search}”</span>
          <button type="button" className="text-brand-ocean font-semibold" onClick={() => { setQuery(""); setSearch(""); setPage(1); }}>Clear</button>
        </div>
      )}

      {error && <div role="alert" className="m-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}

      <ul className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100" data-lenis-prevent>
        {!loading && items.length === 0 && <li className="p-8 text-center text-sm text-slate-500">No emails here.</li>}
        {items.map((m) => (
          <li key={m.uid}>
            <button
              type="button"
              onClick={() => openMessage(m.uid)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-slate-50 transition flex gap-3",
                openUid === m.uid && "bg-sky-50 hover:bg-sky-50",
              )}
            >
              <span className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0", m.seen ? "bg-transparent" : "bg-brand-ocean")} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn("truncate text-sm", m.seen ? "text-slate-700" : "font-bold text-slate-900")}>
                    {isSentFolder ? `To: ${who(m.to)}` : who(m.from)}
                  </span>
                  <span className="text-[11px] text-slate-500 flex-shrink-0">{shortDate(m.date)}</span>
                </span>
                <span className={cn("block truncate text-[13px] mt-0.5", m.seen ? "text-slate-500" : "text-slate-800 font-medium")}>
                  {m.answered && <Reply className="inline w-3 h-3 mr-1 text-slate-400" aria-label="Replied" />}
                  {m.subject}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="pl-2">{total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}` : ""}</span>
        <div className="flex gap-1">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Newer" className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} aria-label="Older" className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );

  const readerPane = (
    <section className={cn("flex-1 min-w-0 min-h-0 flex flex-col bg-white", openUid === null && "hidden lg:flex")}>
      {openUid === null ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">Select an email to read it</div>
      ) : msgLoading || !msg ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (
        <>
          <div className="p-4 border-b border-slate-100">
            <button type="button" onClick={() => setOpenUid(null)} className="lg:hidden mb-3 inline-flex items-center gap-1 text-sm text-brand-ocean font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="text-lg font-bold text-slate-900 break-words">{msg.subject}</h2>
            <div className="mt-2 text-sm text-slate-700">
              <b>{who(msg.from)}</b> <span className="text-slate-500">&lt;{msg.from[0]?.email}&gt;</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              To {addrLine(msg.to)}{msg.cc.length ? ` · Cc ${addrLine(msg.cc)}` : ""} · {fullDate(msg.date)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => reply(false)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy text-white text-xs font-semibold hover:bg-brand-ocean">
                <Reply className="w-3.5 h-3.5" /> Reply
              </button>
              <button type="button" onClick={() => reply(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50">
                <ReplyAll className="w-3.5 h-3.5" /> Reply all
              </button>
              <button type="button" onClick={forward} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50">
                <Forward className="w-3.5 h-3.5" /> Forward
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 p-4" data-lenis-prevent>
            <EmailBody m={msg} />
            {msg.attachments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600 mb-2">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {msg.attachments.map((a) => (
                    <a
                      key={a.index}
                      href={`${BASE}/messages/${msg.uid}/attachments/${a.index}/?folder=${encodeURIComponent(msg.folder)}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 max-w-full"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{a.filename}</span>
                      <span className="text-slate-400 flex-shrink-0">{Math.max(1, Math.round(a.size / 1024))} KB</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-57px)] min-h-0">
      <header className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900">Inbox</h1>
          <p className="text-xs text-slate-500 truncate">{address}</p>
        </div>
        <button
          type="button"
          onClick={() => { setSendError(""); setCompose({ to: "", cc: "", subject: "", body: "" }); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-ocean text-white text-sm font-semibold hover:bg-brand-ocean-light shadow-sm"
        >
          <PenSquare className="w-4 h-4" /> Compose
        </button>
      </header>

      {/* Folders: chips on phones, a column on desktop */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <nav aria-label="Folders" className="lg:w-48 lg:flex-shrink-0 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex lg:flex-col gap-1 p-2 overflow-x-auto">
          {(folders.length ? folders : [{ name: "INBOX", label: "Inbox", role: "Inbox", unread: 0, total: 0 }]).map((f) => {
            const Icon = FOLDER_ICON[f.role || ""] || Folder;
            const active = f.name === folder;
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => { setFolder(f.name); setPage(1); setOpenUid(null); setMsg(null); }}
                className={cn(
                  "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition",
                  active ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200" : "text-slate-600 hover:bg-white/70",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", active ? "text-brand-ocean" : "text-slate-400")} />
                  {f.label.charAt(0).toUpperCase() + f.label.slice(1)}
                </span>
                {f.unread > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-ocean text-white">{f.unread}</span>}
              </button>
            );
          })}
        </nav>
        <div className="flex flex-1 min-h-0">
          {listPane}
          {readerPane}
        </div>
      </div>

      {compose && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="New email">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => !sending && setCompose(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">{compose.inReplyTo ? "Reply" : "New email"}</h2>
              <button type="button" onClick={() => setCompose(null)} disabled={sending} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              className="flex flex-col min-h-0 flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <div className="px-4 pt-3 space-y-2">
                {sendError && <div role="alert" className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">{sendError}</div>}
                {(["to", "cc", "subject"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-3 border-b border-slate-100 pb-2">
                    <span className="w-14 text-xs font-semibold text-slate-500 capitalize">{k}</span>
                    <input
                      value={compose[k]}
                      onChange={(e) => setCompose({ ...compose, [k]: e.target.value })}
                      type={k === "subject" ? "text" : "text"}
                      inputMode={k === "subject" ? "text" : "email"}
                      required={k !== "cc"}
                      placeholder={k === "subject" ? "Subject" : k === "to" ? "customer@example.com" : "Optional"}
                      className="flex-1 text-sm py-1 focus:outline-none"
                    />
                  </label>
                ))}
              </div>
              <textarea
                value={compose.body}
                onChange={(e) => setCompose({ ...compose, body: e.target.value })}
                required
                autoFocus
                rows={14}
                placeholder="Write your message…"
                className="flex-1 min-h-[200px] px-4 py-3 text-sm leading-relaxed focus:outline-none resize-none"
                data-lenis-prevent
              />
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 truncate">Sends from {address}</span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-ocean text-white text-sm font-semibold hover:bg-brand-ocean-light disabled:opacity-60"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
