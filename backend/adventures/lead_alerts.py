"""Email the team the moment a website lead arrives (popup or trip enquiry form).

Sent from a background thread after the DB commit, so a slow or failing mail server
never slows down or breaks the visitor's form submit. Off when MAIL_PASSWORD is unset.
"""
import logging
import os
import re
import threading
from html import escape

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

logger = logging.getLogger(__name__)

SITE_URL = os.getenv("SITE_URL", "https://www.spiritadventures.in").rstrip("/")


def _rows(enquiry):
    phone_digits = re.sub(r"\D", "", enquiry.phone or "")
    if len(phone_digits) == 10:
        phone_digits = "91" + phone_digits
    created = timezone.localtime(enquiry.created_at) if enquiry.created_at else timezone.localtime()
    rows = [
        ("Name", enquiry.full_name, None),
        ("Mobile", enquiry.phone, f"tel:+{phone_digits}" if phone_digits else None),
        ("WhatsApp", "Open chat", f"https://wa.me/{phone_digits}" if phone_digits else None),
        ("Email", enquiry.email or "Not given", f"mailto:{enquiry.email}" if enquiry.email else None),
        ("Trip", enquiry.trip.title if enquiry.trip_id else "Not chosen yet", None),
        ("Travel date", enquiry.travel_date or "", None),
        ("Travellers", str(enquiry.travelers_count or ""), None),
        ("Message", enquiry.message or "", None),
        ("Received", created.strftime("%d %b %Y, %I:%M %p"), None),
    ]
    return [r for r in rows if r[1]]


def build_lead_email(enquiry):
    trip = enquiry.trip.title if enquiry.trip_id else None
    subject = f"New lead: {enquiry.full_name} ({enquiry.phone})" + (f" for {trip}" if trip else "")
    rows = _rows(enquiry)

    text = "New website lead\n\n" + "\n".join(f"{label}: {value}" + (f" ({link})" if link and not link.startswith("tel:") else "")
                                             for label, value, link in rows)
    text += f"\n\nOpen leads: {SITE_URL}/owner/leads\n"

    cells = "".join(
        f'<tr><td style="padding:8px 12px;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">{escape(label)}</td>'
        f'<td style="padding:8px 12px;color:#0f172a;font-size:14px">'
        + (f'<a href="{escape(link)}" style="color:#0e7490">{escape(value)}</a>' if link else escape(value).replace("\n", "<br>"))
        + "</td></tr>"
        for label, value, link in rows
    )
    html = f"""<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto">
  <div style="background:#062B49;color:#fff;padding:18px 20px;border-radius:12px 12px 0 0">
    <div style="font-size:12px;opacity:.8">Spirit Adventures website</div>
    <div style="font-size:20px;font-weight:bold;margin-top:4px">New lead: {escape(enquiry.full_name)}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:0">{cells}</table>
  <p style="text-align:center;margin:18px 0">
    <a href="{SITE_URL}/owner/leads" style="background:#0e7490;color:#fff;padding:11px 22px;border-radius:999px;text-decoration:none;font-size:14px">Open in Owner portal</a>
  </p>
</div>"""

    msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, settings.LEAD_ALERT_EMAILS)
    if enquiry.email:
        msg.reply_to = [enquiry.email]  # "Reply" in your mail app goes straight to the customer
    msg.attach_alternative(html, "text/html")
    return msg


def _send(enquiry_id):
    from .models import Enquiry

    try:
        enquiry = Enquiry.objects.select_related("trip").get(pk=enquiry_id)
        build_lead_email(enquiry).send(fail_silently=False)
    except Exception:  # never let an email problem surface to the visitor
        logger.exception("Lead alert email failed for enquiry %s", enquiry_id)


def send_lead_alert(enquiry):
    if not settings.MAIL_ENABLED or not settings.LEAD_ALERT_EMAILS:
        return
    threading.Thread(target=_send, args=(enquiry.pk,), daemon=True, name=f"lead-alert-{enquiry.pk}").start()
