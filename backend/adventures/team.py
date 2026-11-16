"""Owner-portal team manager: /api/v1/owner/team/... (staff session + CSRF)."""
from typing import List, Optional

from ninja import Router, Schema
from ninja.security import SessionAuthIsStaff

from .models import TeamMember

router = Router(auth=SessionAuthIsStaff(), tags=["Owner Team"])

LIMITS = {
    "name": 120, "role": 120, "bio": 600, "photo_url": 500, "city": 80,
    "experience": 80, "instagram_url": 300, "linkedin_url": 300,
}
URL_FIELDS = ("photo_url", "instagram_url", "linkedin_url")


def _err(request, msg: str, status: int = 400):
    from .api import api
    return api.create_response(request, {"success": False, "data": None, "message": msg}, status=status)


def member_out(m: TeamMember) -> dict:
    return {
        "id": m.id, "name": m.name, "role": m.role, "bio": m.bio, "photo_url": m.photo_url,
        "city": m.city, "experience": m.experience, "instagram_url": m.instagram_url,
        "linkedin_url": m.linkedin_url, "is_lead": m.is_lead, "ordering": m.ordering,
        "is_published": m.is_published,
    }


def _clean(data: dict) -> Optional[str]:
    """Trim/limit text fields in place. Returns an error message or None."""
    for k, limit in LIMITS.items():
        if k in data and data[k] is not None:
            data[k] = str(data[k]).strip()[:limit]
    for k in URL_FIELDS:
        v = data.get(k)
        if v and not (v.startswith("https://") or (k == "photo_url" and v.startswith("/images/"))):
            return "Links must start with https://"
    return None


class MemberIn(Schema):
    name: str
    role: str
    bio: Optional[str] = ""
    photo_url: Optional[str] = ""
    city: Optional[str] = ""
    experience: Optional[str] = ""
    instagram_url: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    is_lead: Optional[bool] = False
    is_published: Optional[bool] = True


class MemberUpdateIn(Schema):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    city: Optional[str] = None
    experience: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_lead: Optional[bool] = None
    is_published: Optional[bool] = None


class ReorderIn(Schema):
    ids: List[int]


@router.get("/team/")
def owner_team(request):
    items = [member_out(m) for m in TeamMember.objects.all()]
    return {"success": True, "data": items, "message": f"{len(items)} team members"}


@router.post("/team/")
def owner_team_add(request, payload: MemberIn):
    data = payload.dict()
    problem = _clean(data)
    if problem:
        return _err(request, problem)
    if not data["name"] or not data["role"]:
        return _err(request, "Name and role are required.")
    last = TeamMember.objects.order_by("-ordering").values_list("ordering", flat=True).first() or 0
    data["is_published"] = data.get("is_published") is not False
    data["is_lead"] = bool(data.get("is_lead"))
    m = TeamMember.objects.create(ordering=last + 1, **data)
    return {"success": True, "data": member_out(m), "message": f"{m.name} added to the team"}


@router.post("/team/reorder/")
def owner_team_reorder(request, payload: ReorderIn):
    members = {m.id: m for m in TeamMember.objects.filter(id__in=payload.ids)}
    for pos, mid in enumerate(payload.ids):
        m = members.get(mid)
        if m and m.ordering != pos:
            m.ordering = pos
            m.save(update_fields=["ordering"])
    return {"success": True, "data": payload.ids, "message": "Order saved"}


@router.post("/team/{member_id}/")
def owner_team_update(request, member_id: int, payload: MemberUpdateIn):
    m = TeamMember.objects.filter(id=member_id).first()
    if not m:
        return _err(request, "Team member not found.", 404)
    data = payload.dict(exclude_none=True)
    problem = _clean(data)
    if problem:
        return _err(request, problem)
    if ("name" in data and not data["name"]) or ("role" in data and not data["role"]):
        return _err(request, "Name and role can't be empty.")
    for k, v in data.items():
        setattr(m, k, v)
    m.save()
    return {"success": True, "data": member_out(m), "message": f"{m.name} updated"}


@router.delete("/team/{member_id}/")
def owner_team_delete(request, member_id: int):
    deleted, _ = TeamMember.objects.filter(id=member_id).delete()
    if not deleted:
        return _err(request, "Team member not found.", 404)
    return {"success": True, "data": {"id": member_id}, "message": "Removed from the team"}
