"""
Website -> CRM bridge (same database, called in-process by adventures.crm).

  create_lead_from_website(data)  one website enquiry becomes a CRM lead
  upsert_packages(items)          website trips are mirrored as CRM TourPackages

Both are idempotent: re-running for the same enquiry or trip updates instead of
duplicating, so `manage.py sync_crm` can be repeated safely.
"""
import re
from datetime import date, datetime
from decimal import Decimal
from typing import Iterable, Optional

from django.db import transaction
from django.db.models import Count, Q

from crm.accounts.models import CustomUser
from .models import Enquiry, EnquiryComment, TourPackage


class _Obj:
    """Attribute access over a dict, missing keys read as None."""

    def __init__(self, data: dict):
        self.__dict__.update(data)

    def __getattr__(self, name):
        return None


_DATE_FORMATS = ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d %B %Y", "%d %b %Y", "%B %d, %Y")
_MONTH_FORMATS = ("%B %Y", "%b %Y", "%Y-%m")


def parse_travel_date(raw: Optional[str]) -> Optional[date]:
    """Best-effort parse of the free-text date typed on the website."""
    if not raw:
        return None
    text = re.sub(r"\s+", " ", raw.strip())
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            pass
    for fmt in _MONTH_FORMATS:  # "December 2026" -> 1 Dec 2026
        try:
            return datetime.strptime(text, fmt).date().replace(day=1)
        except ValueError:
            pass
    return None


def _pick_sales_person() -> Optional[CustomUser]:
    """Assign to the active sales person with the fewest open leads."""
    return (
        CustomUser.objects.filter(is_active=True, is_approved=True, role__in=["sales_person", "counselor"])
        .annotate(open_leads=Count("assigned_enquiries", filter=Q(assigned_enquiries__status__in=["new", "contacted"])))
        .order_by("open_leads", "id")
        .first()
    )


def create_lead_from_website(data: dict) -> dict:
    """data keys: external_id, name, phone, email, departure_city, trip_title,
    trip_slug, travel_date, travelers_count, message."""
    payload = _Obj(data)
    ref = f"web-{payload.external_id}"

    existing = Enquiry.objects.filter(external_ref=ref).first()
    if existing:
        return {"id": existing.id, "created": False}

    package = None
    if payload.trip_slug:
        package = TourPackage.objects.filter(website_slug=payload.trip_slug).first()
    if not package and payload.trip_title:
        package = TourPackage.objects.filter(name__iexact=payload.trip_title).first()

    travel = parse_travel_date(payload.travel_date)
    people = max(1, payload.travelers_count or 1)

    note_lines = ["Source: Website enquiry"]
    if payload.travel_date and not travel:
        note_lines.append(f"Preferred travel date (as typed): {payload.travel_date}")
    elif not payload.travel_date:
        note_lines.append("No travel date given - confirm on call")
    if payload.message:
        note_lines.append(f"Message: {payload.message.strip()}")
    notes = "\n".join(note_lines)

    with transaction.atomic():
        enquiry = Enquiry(
            name=payload.name.strip()[:120],
            contact=payload.phone.strip()[:20],
            email=(payload.email or "").strip() or None,
            departure_city=(payload.departure_city or "").strip()[:80] or "Bangalore",
            tour_package=package,
            custom_tour_name=None if package else (payload.trip_title or "Website Enquiry")[:150],
            # CRM needs a date; when the visitor gave none we use today and flag it in notes
            date_of_travel=travel or date.today(),
            followup_date=date.today(),
            total_people=people,
            total_amount=(package.base_price * people) if package else Decimal("0.00"),
            status="new",
            source="website",
            external_ref=ref,
            sales_person=_pick_sales_person(),
            notes=notes,
        )
        enquiry.save()
        EnquiryComment.objects.create(
            enquiry=enquiry,
            author=None,
            call_status="general_note",
            comment_text=f"New lead from the website. {notes}",
        )
    return {"id": enquiry.id, "created": True}


def upsert_packages(items: Iterable[dict]) -> dict:
    """items keys: slug, title, destination, duration_days, price, is_active."""
    created = updated = 0
    for raw in items:
        p = _Obj(raw)
        pkg = TourPackage.objects.filter(website_slug=p.slug).first()
        if not pkg:
            # Adopt a package someone already typed into the CRM with the same name
            pkg = TourPackage.objects.filter(name__iexact=p.title, website_slug__isnull=True).first()
        name = p.title[:150]
        others = TourPackage.objects.filter(name__iexact=name)
        if pkg:
            others = others.exclude(pk=pkg.pk)
        if others.exists():
            # CRM package names are unique; tell same-titled website trips apart by slug
            suffix = f" ({p.slug})"
            name = p.title[: 150 - len(suffix)] + suffix
        fields = dict(
            name=name,
            destination=p.destination[:100],
            duration_days=max(1, int(p.duration_days or 1)),
            base_price=Decimal(str(p.price or 0)),
            is_active=p.is_active,
            website_slug=p.slug,
        )
        if pkg:
            for k, v in fields.items():
                setattr(pkg, k, v)
            pkg.save()
            updated += 1
        else:
            TourPackage.objects.create(**fields)
            created += 1
    return {"created": created, "updated": updated}
