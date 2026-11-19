"""Landing page content: public read at /api/v1/site/content/, owner edit at /api/v1/owner/site-content/."""
from typing import List, Optional

from ninja import Router, Schema
from ninja.security import SessionAuthIsStaff

from .cache import cached_public
from .models import SiteContent, Trip
from .ratelimit import rate_limit

public_router = Router(tags=["Site"])
router = Router(auth=SessionAuthIsStaff(), tags=["Owner Landing Page"])

MAX_HERO_VIDEOS = 6
MAX_HOME_TRIPS = 12
SOCIAL_HOSTS = {
    "instagram_url": ("instagram.com", "www.instagram.com"),
    "youtube_url": ("youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"),
}


def _err(request, msg: str, status: int = 400):
    from .api import api
    return api.create_response(request, {"success": False, "data": None, "message": msg}, status=status)


def _is_https(url: str) -> bool:
    return url.startswith("https://")


def _host(url: str) -> str:
    return url.split("://", 1)[-1].split("/", 1)[0].split("?", 1)[0].lower()


def content_out(c: SiteContent) -> dict:
    return {
        "instagram_url": c.instagram_url,
        "youtube_url": c.youtube_url,
        "hero_words": [w for w in (s.strip() for s in c.hero_words.split(",")) if w],
        "hero_subtitle": c.hero_subtitle,
        "hero_videos": c.hero_videos or [],
        "home_trip_ids": c.home_trip_ids or [],
        "quote_image_url": c.quote_image_url,
        "cta_image_url": c.cta_image_url,
        "hidden_sections": c.hidden_sections or [],
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


class HeroVideoIn(Schema):
    video_url: str
    poster_url: Optional[str] = ""


class ContentIn(Schema):
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    hero_words: Optional[List[str]] = None
    hero_subtitle: Optional[str] = None
    hero_videos: Optional[List[HeroVideoIn]] = None
    home_trip_ids: Optional[List[int]] = None
    quote_image_url: Optional[str] = None
    cta_image_url: Optional[str] = None
    hidden_sections: Optional[List[str]] = None


def apply_content(c: SiteContent, payload: ContentIn) -> Optional[str]:
    """Validate the payload and copy it onto `c`. Returns an error message or None."""
    data = payload.dict(exclude_none=True)

    for key, hosts in SOCIAL_HOSTS.items():
        if key in data:
            url = data[key].strip()[:300]
            if url and (not _is_https(url) or _host(url) not in hosts):
                label = "Instagram" if key == "instagram_url" else "YouTube"
                return f"{label} link must be an https:// {label} address."
            setattr(c, key, url)

    if "hero_words" in data:
        words = [w.strip()[:24] for w in data["hero_words"] if w and w.strip()][:8]
        c.hero_words = ",".join(w.replace(",", " ") for w in words)

    if "hero_subtitle" in data:
        c.hero_subtitle = data["hero_subtitle"].strip()[:240]

    if "hero_videos" in data:
        videos = []
        for v in data["hero_videos"][:MAX_HERO_VIDEOS]:
            video, poster = v["video_url"].strip()[:500], (v.get("poster_url") or "").strip()[:500]
            if not video:
                continue
            if not _is_https(video) or (poster and not _is_https(poster)):
                return "Hero video and poster links must start with https://"
            videos.append({"video_url": video, "poster_url": poster})
        c.hero_videos = videos

    if "home_trip_ids" in data:
        wanted = list(dict.fromkeys(data["home_trip_ids"]))[:MAX_HOME_TRIPS]
        existing = set(Trip.objects.filter(id__in=wanted).values_list("id", flat=True))
        c.home_trip_ids = [i for i in wanted if i in existing]

    for key in ("quote_image_url", "cta_image_url"):
        if key in data:
            url = data[key].strip()[:500]
            if url and not _is_https(url):
                return "Image links must start with https://"
            setattr(c, key, url)

    if "hidden_sections" in data:
        unknown = set(data["hidden_sections"]) - set(SiteContent.SECTION_KEYS)
        if unknown:
            return f"Unknown section: {', '.join(sorted(unknown))}"
        c.hidden_sections = [k for k in SiteContent.SECTION_KEYS if k in data["hidden_sections"]]
    return None


@public_router.get("/site/content/")
@rate_limit(max_requests=120, window_seconds=60, bucket_name="public_site")
@cached_public()
def site_content(request):
    return {"success": True, "data": content_out(SiteContent.current()), "message": "Site content"}


@router.get("/site-content/")
def owner_site_content(request):
    return {"success": True, "data": content_out(SiteContent.current()), "message": "Site content"}


@router.post("/site-content/")
def owner_site_content_update(request, payload: ContentIn):
    c = SiteContent.current()
    problem = apply_content(c, payload)
    if problem:
        return _err(request, problem)
    c.save()
    return {"success": True, "data": content_out(c), "message": "Landing page saved"}
