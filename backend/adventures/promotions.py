"""Owner HQ → Offers: events, offers and the festive site theme. /api/v1/owner/promotions/..."""
import datetime
from decimal import Decimal, InvalidOperation
from typing import List, Optional

from django.utils import timezone
from ninja import Router, Schema
from ninja.security import SessionAuthIsStaff

from .models import Promotion, SiteTheme, Trip

router = Router(auth=SessionAuthIsStaff(), tags=["Owner Offers"])

LIMITS = {"title": 150, "description": 1000, "image_url": 500, "badge": 40, "location": 120, "cta_label": 40}

GREETINGS = {
    'CHRISTMAS': 'Merry Christmas from Spirit Adventures! Festive trips and offers are live',
    'NEWYEAR': 'Happy New Year! Start the year with an adventure. New Year offers are live',
    'SANKRANTI': 'Happy Sankranti! Fly higher this harvest season. Sankranti offers are live',
    'UGADI': 'Ugadi Shubhakankshalu! A new year, a new trail. Ugadi offers are live',
    'DIWALI': 'Happy Diwali! Light up your holidays with an adventure. Diwali offers are live',
}
FESTIVALS = tuple(GREETINGS)


def _err(request, msg, status=400):
    from .api import api
    return api.create_response(request, {"success": False, "data": None, "message": msg}, status=status)


def today():
    return timezone.localdate()


def active_theme(setting=None, live=None):
    """
    The theme the site shows now. AUTO: the festival of the first live offer/event
    tagged with one, so the look changes only while there is something festive to book.
    """
    setting = setting or SiteTheme.current()
    if setting.theme != 'AUTO':
        return setting.theme
    for p in (live if live is not None else live_promotions()):
        if p.festival in FESTIVALS:
            return p.festival
    return 'NONE'


def theme_out(s: SiteTheme, public=False, live=None) -> dict:
    active = active_theme(s, live)
    data = {
        "active": active,
        "banner_text": (s.banner_text or GREETINGS.get(active, "")) if active != 'NONE' else "",
        "banner_link": s.banner_link or "/offers",
        "snow": s.snow,
    }
    if not public:
        data.update({"theme": s.theme, "custom_banner_text": s.banner_text})
    return data


def promo_out(p: Promotion) -> dict:
    trip = p.trip
    return {
        "id": p.id, "kind": p.kind, "festival": p.festival, "title": p.title, "description": p.description,
        "image_url": p.image_url or (trip.cover_image if trip else ""),
        "badge": p.badge, "trip_id": trip.id if trip else None,
        "trip_slug": trip.slug if trip else "", "trip_title": trip.title if trip else "",
        "price": float(p.price) if p.price is not None else None,
        "original_price": float(p.original_price) if p.original_price is not None else None,
        "location": p.location,
        "event_date": p.event_date.isoformat() if p.event_date else None,
        "starts_on": p.starts_on.isoformat() if p.starts_on else None,
        "ends_on": p.ends_on.isoformat() if p.ends_on else None,
        "cta_label": p.cta_label or "Book now",
        "is_published": p.is_published, "ordering": p.ordering,
    }


def live_promotions():
    d = today()
    qs = Promotion.objects.filter(is_published=True).select_related('trip')
    return [p for p in qs if (not p.starts_on or p.starts_on <= d) and (not p.ends_on or p.ends_on >= d)
            and (not p.event_date or p.event_date >= d)]


def _clean(request, data: dict):
    """Validate in place. Returns an error response or None."""
    for k, limit in LIMITS.items():
        if data.get(k) is not None:
            data[k] = str(data[k]).strip()[:limit]
    if "kind" in data and data["kind"] not in ("OFFER", "EVENT"):
        return _err(request, "Choose Offer or Event.")
    if "festival" in data and data["festival"] not in ("NONE",) + FESTIVALS:
        return _err(request, "Unknown festival.")
    img = data.get("image_url")
    if img and not (img.startswith("https://") or img.startswith("/images/")):
        return _err(request, "Image links must start with https://")
    for k in ("price", "original_price"):
        if k in data:
            v = data[k]
            if v in ("", None):
                data[k] = None
                continue
            try:
                data[k] = Decimal(str(v))
            except InvalidOperation:
                return _err(request, "Prices must be numbers.")
            if data[k] < 0 or data[k] > Decimal("10000000"):
                return _err(request, "Price looks wrong.")
    for k in ("event_date", "starts_on", "ends_on"):
        if k in data:
            v = data[k]
            if not v:
                data[k] = None
                continue
            try:
                data[k] = datetime.date.fromisoformat(str(v)[:10])
            except ValueError:
                return _err(request, "Dates must look like 2026-12-25.")
    if data.get("starts_on") and data.get("ends_on") and data["ends_on"] < data["starts_on"]:
        return _err(request, "The end date is before the start date.")
    if "trip_id" in data:
        tid = data.pop("trip_id")
        data["trip"] = Trip.objects.filter(id=tid).first() if tid else None
        if tid and not data["trip"]:
            return _err(request, "That trip no longer exists.")
    return None


class PromoIn(Schema):
    kind: str = "OFFER"
    festival: str = "NONE"
    title: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    badge: Optional[str] = ""
    trip_id: Optional[int] = None
    price: Optional[str] = None
    original_price: Optional[str] = None
    location: Optional[str] = ""
    event_date: Optional[str] = None
    starts_on: Optional[str] = None
    ends_on: Optional[str] = None
    cta_label: Optional[str] = "Book now"
    is_published: Optional[bool] = True


class PromoUpdateIn(Schema):
    kind: Optional[str] = None
    festival: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    badge: Optional[str] = None
    trip_id: Optional[int] = None
    clear_trip: Optional[bool] = None
    price: Optional[str] = None
    original_price: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[str] = None
    starts_on: Optional[str] = None
    ends_on: Optional[str] = None
    cta_label: Optional[str] = None
    is_published: Optional[bool] = None


class ReorderIn(Schema):
    ids: List[int]


class ThemeIn(Schema):
    theme: Optional[str] = None
    banner_text: Optional[str] = None
    banner_link: Optional[str] = None
    snow: Optional[bool] = None


@router.get("/promotions/")
def owner_promotions(request):
    items = [promo_out(p) for p in Promotion.objects.select_related('trip')]
    trips = list(Trip.objects.filter(is_published=True).order_by('title').values('id', 'title', 'slug'))
    return {"success": True, "data": {"items": items, "trips": trips, "theme": theme_out(SiteTheme.current())},
            "message": f"{len(items)} events & offers"}


@router.post("/promotions/")
def owner_promotion_add(request, payload: PromoIn):
    data = payload.dict()
    bad = _clean(request, data)
    if bad:
        return bad
    if not data["title"]:
        return _err(request, "Title is required.")
    last = Promotion.objects.order_by("-ordering").values_list("ordering", flat=True).first() or 0
    data["is_published"] = data.get("is_published") is not False
    p = Promotion.objects.create(ordering=last + 1, **data)
    return {"success": True, "data": promo_out(p), "message": f"{p.get_kind_display()} '{p.title}' created"}


@router.post("/promotions/reorder/")
def owner_promotion_reorder(request, payload: ReorderIn):
    rows = {p.id: p for p in Promotion.objects.filter(id__in=payload.ids)}
    for pos, pid in enumerate(payload.ids):
        p = rows.get(pid)
        if p and p.ordering != pos:
            p.ordering = pos
            p.save(update_fields=["ordering"])
    return {"success": True, "data": payload.ids, "message": "Order saved"}


@router.post("/promotions/theme/")
def owner_theme_update(request, payload: ThemeIn):
    s = SiteTheme.current()
    data = payload.dict(exclude_none=True)
    if "theme" in data:
        if data["theme"] not in dict(SiteTheme.THEME_CHOICES):
            return _err(request, "Unknown theme.")
        s.theme = data["theme"]
    if "banner_text" in data:
        s.banner_text = data["banner_text"].strip()[:160]
    if "banner_link" in data:
        link = data["banner_link"].strip()[:300]
        if link and not (link.startswith("/") or link.startswith("https://")):
            return _err(request, "Banner link must start with / or https://")
        s.banner_link = link
    if "snow" in data:
        s.snow = data["snow"]
    s.save()
    return {"success": True, "data": theme_out(s), "message": "Site theme saved"}


@router.post("/promotions/{promo_id}/")
def owner_promotion_update(request, promo_id: int, payload: PromoUpdateIn):
    p = Promotion.objects.filter(id=promo_id).first()
    if not p:
        return _err(request, "Not found.", 404)
    data = payload.dict(exclude_unset=True)
    if data.pop("clear_trip", None):
        data["trip_id"] = None
    elif data.get("trip_id") is None:
        data.pop("trip_id", None)
    data = {k: v for k, v in data.items() if v is not None or k in ("trip_id", "price", "original_price",
                                                                     "event_date", "starts_on", "ends_on")}
    bad = _clean(request, data)
    if bad:
        return bad
    if "title" in data and not data["title"]:
        return _err(request, "Title can't be empty.")
    for k, v in data.items():
        setattr(p, k, v)
    p.save()
    return {"success": True, "data": promo_out(p), "message": f"'{p.title}' saved"}


@router.delete("/promotions/{promo_id}/")
def owner_promotion_delete(request, promo_id: int):
    deleted, _ = Promotion.objects.filter(id=promo_id).delete()
    if not deleted:
        return _err(request, "Not found.", 404)
    return {"success": True, "data": {"id": promo_id}, "message": "Deleted"}
