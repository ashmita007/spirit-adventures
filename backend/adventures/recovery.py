"""
Recover uploads after a database reset. Photos and videos live on Cloudinary, so even if
the database loses its rows the files are still there. This lists them via the Cloudinary
Admin API and re-adds missing gallery photos; other uploads (trips, videos, destinations,
team, blog) are returned so the owner can re-attach them.
"""
import base64
import json
import re
import urllib.parse
import urllib.request

from django.conf import settings

from .models import GalleryImage, TeamMember, Trip, TripImage, TripVideo, Destination

FOLDERS = ("gallery", "trips", "videos", "destinations", "team", "blog")


def _api(path: str, params: dict) -> dict:
    url = f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/{path}?{urllib.parse.urlencode(params)}"
    auth = base64.b64encode(f"{settings.CLOUDINARY_API_KEY}:{settings.CLOUDINARY_API_SECRET}".encode()).decode()
    req = urllib.request.Request(url, headers={"Authorization": f"Basic {auth}"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def _list(resource_type: str, folder: str) -> list:
    """All assets in one folder. Works for both fixed-folder and dynamic-folder accounts."""
    full = f"{settings.CLOUDINARY_FOLDER}/{folder}"
    out, seen = [], set()
    for path, params in (
        (f"resources/{resource_type}/upload", {"prefix": full + "/", "max_results": 500}),
        (f"resources/by_asset_folder", {"asset_folder": full, "max_results": 500}),
    ):
        cursor = None
        while True:
            p = dict(params)
            if cursor:
                p["next_cursor"] = cursor
            try:
                data = _api(path, p)
            except Exception:
                break
            for r in data.get("resources", []):
                if r.get("resource_type", resource_type) != resource_type:
                    continue
                if r["secure_url"] not in seen:
                    seen.add(r["secure_url"])
                    out.append(r)
            cursor = data.get("next_cursor")
            if not cursor:
                break
        if out:
            break
    return out


def _known_urls() -> set:
    urls = set(GalleryImage.objects.values_list("image_url", flat=True))
    urls |= set(TripImage.objects.values_list("image_url", flat=True))
    urls |= set(TeamMember.objects.values_list("photo_url", flat=True))
    for model, fields in ((Trip, ("cover_image", "hero_video_url")),
                          (TripVideo, ("video_url", "poster_image")),
                          (Destination, ("cover_image", "hero_image", "video_url"))):
        names = {f.name for f in model._meta.fields}
        for f in fields:
            if f in names:
                urls |= set(model.objects.values_list(f, flat=True))
    return {u for u in urls if u}


def _title_from(public_id: str) -> str:
    name = public_id.rsplit("/", 1)[-1]
    name = re.sub(r"_[a-z0-9]{6}$", "", name)  # Cloudinary's random suffix
    name = re.sub(r"[-_]+", " ", name).strip()
    return (name[:1].upper() + name[1:])[:150] if name else "Spirit Adventures moment"


def recover(add_gallery: bool = True) -> dict:
    if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
        raise RuntimeError("Cloudinary is not connected (CLOUDINARY_URL missing).")
    known = _known_urls()
    added, others = [], []
    for folder in FOLDERS:
        kinds = ("image", "video") if folder in ("videos", "trips", "destinations") else ("image",)
        for kind in kinds:
            for r in _list(kind, folder):
                url = r["secure_url"]
                if url in known:
                    continue
                if folder == "gallery" and kind == "image":
                    if add_gallery:
                        g = GalleryImage.objects.create(
                            image_url=url[:500], title=_title_from(r["public_id"]),
                            category="Mountains", is_published=True, ordering=0,
                        )
                        known.add(url)
                        added.append({"id": g.id, "image_url": url, "title": g.title})
                    continue
                others.append({
                    "folder": folder, "type": kind, "url": url,
                    "name": _title_from(r["public_id"]), "created_at": r.get("created_at"),
                })
    others.sort(key=lambda o: o.get("created_at") or "", reverse=True)
    return {"gallery_added": added, "other_uploads": others}
