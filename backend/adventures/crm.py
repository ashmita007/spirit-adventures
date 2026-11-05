"""
Website -> built-in CRM (crm.* apps, same database).

- push_enquiry(enquiry): website enquiry -> CRM lead. Result is stored on the Enquiry.
- push_trips(trips): mirror trips as CRM TourPackages.
- `python manage.py sync_crm` retries failed enquiries and re-sends all packages.

Both calls are idempotent, so retries are safe. A CRM problem is logged and saved
on the enquiry; it never breaks the visitor's form submission.
"""
import logging

from django.utils import timezone

log = logging.getLogger(__name__)


def is_enabled() -> bool:
    return True


def enquiry_payload(enquiry) -> dict:
    trip = enquiry.trip
    return {
        "external_id": enquiry.id,
        "name": enquiry.full_name,
        "phone": enquiry.phone,
        "email": enquiry.email or None,
        "departure_city": enquiry.departure_city or None,
        "trip_title": trip.title if trip else None,
        "trip_slug": trip.slug if trip else None,
        "travel_date": enquiry.travel_date or None,
        "travelers_count": enquiry.travelers_count or 1,
        "message": enquiry.message or None,
    }


def push_enquiry(enquiry) -> bool:
    """Create the CRM lead; records success/failure on the row. Returns True on success."""
    from crm.enquiries.services import create_lead_from_website

    from .models import Enquiry

    try:
        result = create_lead_from_website(enquiry_payload(enquiry))
        Enquiry.objects.filter(pk=enquiry.pk).update(
            crm_lead_id=result.get("id"), crm_synced_at=timezone.now(), crm_sync_error=""
        )
        return True
    except Exception as e:  # never let CRM problems break the website
        log.exception("CRM lead creation failed for enquiry #%s", enquiry.pk)
        Enquiry.objects.filter(pk=enquiry.pk).update(crm_sync_error=str(e)[:300])
        return False


def trip_payload(trip) -> dict:
    return {
        "slug": trip.slug,
        "title": trip.title,
        "destination": trip.destination.name if trip.destination_id else "",
        "duration_days": trip.duration_days or 1,
        "price": trip.price,
        "is_active": bool(trip.is_published),
    }


def push_trips(trips) -> dict:
    from crm.enquiries.services import upsert_packages

    try:
        return upsert_packages(trip_payload(t) for t in trips)
    except Exception as e:
        log.exception("CRM package sync failed")
        return {"error": str(e)}
