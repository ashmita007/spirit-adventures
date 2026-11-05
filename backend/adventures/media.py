"""
Owner-portal media: signed direct uploads to Cloudinary + the public photo gallery.

Flow for an upload:
  1. Owner portal asks POST /owner/media/sign/ for a signature (staff only).
  2. Browser uploads the file straight to Cloudinary with that signature.
  3. The returned secure_url is saved on a trip / gallery item like any other link.
"""
import hashlib
import time
from typing import List, Optional

from django.conf import settings
from ninja import Router, Schema
from ninja.security import SessionAuthIsStaff

from .models import GalleryImage

router = Router(auth=SessionAuthIsStaff(), tags=["Owner Media"])

FOLDERS = {"gallery", "trips", "videos", "destinations", "blog"}
MAX_BULK = 50


def cloudinary_ready() -> bool:
    return bool(settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET)


def _sign(params: dict) -> str:
    to_sign = "&".join(f"{k}={params[k]}" for k in sorted(params) if params[k] not in ("", None))
    return hashlib.sha1((to_sign + settings.CLOUDINARY_API_SECRET).encode()).hexdigest()


def _err(request, msg: str, status: int = 400):
    from .api import api
    return api.create_response(request, {"success": False, "data": None, "message": msg}, status=status)


# ----------------- Upload signing -----------------
class SignIn(Schema):
    folder: str = "gallery"
    resource_type: str = "image"  # image | video


@router.get("/media/status/")
def media_status(request):
    return {
        "success": True,
        "data": {"configured": cloudinary_ready(), "cloud_name": settings.CLOUDINARY_CLOUD_NAME or None},
        "message": "Cloudinary is connected" if cloudinary_ready() else
                   "Cloudinary keys are missing. Add CLOUDINARY_URL to the backend environment.",
    }


@router.post("/media/sign/")
def media_sign(request, payload: SignIn):
    if not cloudinary_ready():
        return _err(request, "Cloudinary is not connected yet. Add CLOUDINARY_URL to the backend environment.", 503)
    if payload.folder not in FOLDERS:
        return _err(request, "Unknown upload folder.")
    if payload.resource_type not in ("image", "video"):
        return _err(request, "Only photos and videos can be uploaded.")

    params = {
        "folder": f"{settings.CLOUDINARY_FOLDER}/{payload.folder}",
        "timestamp": int(time.time()),
    }
    return {
        "success": True,
        "data": {
            **params,
            "signature": _sign(params),
            "api_key": settings.CLOUDINARY_API_KEY,
            "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
            "upload_url": f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/{payload.resource_type}/upload",
        },
        "message": "Upload signature ready",
    }


# ----------------- Gallery manager -----------------
def _url_ok(url: str) -> bool:
    return url.startswith("https://") or url.startswith("/images/")


def _out(g: GalleryImage) -> dict:
    return {
        "id": g.id,
        "title": g.title,
        "category": g.category,
        "image_url": g.image_url,
        "caption": g.caption,
        "location": g.location,
        "ordering": g.ordering,
        "is_featured": g.is_featured,
        "is_published": g.is_published,
    }


class GalleryItemIn(Schema):
    image_url: str
    title: Optional[str] = ""
    category: Optional[str] = "Mountains"
    caption: Optional[str] = ""
    location: Optional[str] = ""
    is_featured: Optional[bool] = False
    is_published: Optional[bool] = True


class GalleryBulkIn(Schema):
    items: List[GalleryItemIn]


class GalleryUpdateIn(Schema):
    title: Optional[str] = None
    category: Optional[str] = None
    caption: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    ordering: Optional[int] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None


@router.get("/gallery/")
def owner_gallery(request):
    items = [_out(g) for g in GalleryImage.objects.all()]
    cats = sorted({i["category"] for i in items} | {"Mountains", "Lakes", "Camping", "Treks", "Sunrises", "Beaches", "Waterfalls"})
    return {"success": True, "data": {"items": items, "categories": cats}, "message": f"{len(items)} photos"}


@router.post("/gallery/")
def owner_gallery_add(request, payload: GalleryBulkIn):
    if not payload.items:
        return _err(request, "Add at least one photo.")
    if len(payload.items) > MAX_BULK:
        return _err(request, f"Add up to {MAX_BULK} photos at a time.")
    for it in payload.items:
        if not _url_ok((it.image_url or "").strip()):
            return _err(request, "Every photo needs an https:// link (uploads do this for you).")

    top = GalleryImage.objects.order_by("ordering").values_list("ordering", flat=True).first() or 0
    created = []
    for n, it in enumerate(payload.items):
        created.append(GalleryImage.objects.create(
            image_url=it.image_url.strip()[:500],
            title=((it.title or "").strip() or "Spirit Adventures moment")[:150],
            category=((it.category or "").strip() or "Mountains")[:100],
            caption=(it.caption or "").strip()[:250],
            location=(it.location or "").strip()[:150],
            is_featured=bool(it.is_featured),
            is_published=it.is_published is not False,
            # New photos show first
            ordering=max(0, top - len(payload.items) + n),
        ))
    return {"success": True, "data": [_out(g) for g in created], "message": f"Added {len(created)} photo(s) to the gallery"}


@router.post("/gallery/{item_id}/")
def owner_gallery_update(request, item_id: int, payload: GalleryUpdateIn):
    g = GalleryImage.objects.filter(id=item_id).first()
    if not g:
        return _err(request, "Photo not found.", 404)
    data = payload.dict(exclude_none=True)
    if "image_url" in data and not _url_ok(data["image_url"].strip()):
        return _err(request, "The photo link must start with https://")
    limits = {"title": 150, "category": 100, "caption": 250, "location": 150, "image_url": 500}
    for k, v in data.items():
        setattr(g, k, v.strip()[:limits[k]] if k in limits else v)
    if not g.title:
        g.title = "Spirit Adventures moment"
    g.save()
    return {"success": True, "data": _out(g), "message": "Photo updated"}


@router.delete("/gallery/{item_id}/")
def owner_gallery_delete(request, item_id: int):
    deleted, _ = GalleryImage.objects.filter(id=item_id).delete()
    if not deleted:
        return _err(request, "Photo not found.", 404)
    return {"success": True, "data": {"id": item_id}, "message": "Photo removed from the gallery"}
