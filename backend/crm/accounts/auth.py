"""
CRM authentication.

The CRM shares the website's single login: a Django session cookie set by
POST /api/v1/auth/login/. Unsafe methods also need the X-CSRFToken header
(ninja's SessionAuth enforces CSRF for cookie auth).

  CrmAuth      any active, approved team member (sales rep, counselor, manager, admin)
  ManagerAuth  managers and admins only

The old names (AuthBearer, ManagerBearer, OptionalAuthBearer) are kept as
aliases so the CRM routers read the same as before; they no longer use JWTs.
"""
from ninja.errors import HttpError
from ninja.security import SessionAuth

from .models import CustomUser


def _active_member(request):
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return None
    if not user.is_active or not getattr(user, "is_approved", False):
        return None
    return user


class CrmAuth(SessionAuth):
    def authenticate(self, request, key):
        return _active_member(request)


class ManagerAuth(SessionAuth):
    def authenticate(self, request, key):
        user = _active_member(request)
        if user and user.is_manager_or_admin:
            return user
        return None


# Backwards-compatible names used across the CRM routers
AuthBearer = CrmAuth
OptionalAuthBearer = CrmAuth
ManagerBearer = ManagerAuth


def enforce_role(user: CustomUser, allowed_roles: list):
    """Raise 401/403 unless the user has one of allowed_roles (superusers always pass)."""
    if not user or not user.is_authenticated:
        raise HttpError(401, "Authentication credentials were not provided.")
    if user.is_superuser:
        return True
    if user.role not in allowed_roles:
        raise HttpError(403, "You do not have permission to do this.")
    return True


def scope_to_user(qs, request, field: str = "sales_person"):
    """Sales reps only ever see their own leads; managers see everything."""
    user = getattr(request, "user", None)
    if user and user.is_authenticated and not user.is_manager_or_admin:
        return qs.filter(**{field: user})
    return qs
