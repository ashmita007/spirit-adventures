"""Response cache for the public read API.

Public pages (trips, destinations, gallery, blog, reviews) change only when the owner edits
something, so their JSON is cached and every cached entry is dropped the moment any of the
underlying models is saved or deleted (see signals.py). A short TTL is the safety net.
"""
from functools import wraps

from django.core.cache import cache

PUBLIC_TTL = 300  # seconds
_VERSION_KEY = "public-api-version"


def _version() -> int:
    version = cache.get(_VERSION_KEY)
    if version is None:
        cache.add(_VERSION_KEY, 1, None)
        version = cache.get(_VERSION_KEY, 1)
    return version


def invalidate_public_cache(*_args, **_kwargs) -> None:
    """Make every cached public response unreachable (old entries expire on their own)."""
    try:
        cache.incr(_VERSION_KEY)
    except ValueError:  # key not set yet
        cache.set(_VERSION_KEY, 2, None)


def cached_public(ttl: int = PUBLIC_TTL):
    """Cache a GET endpoint's successful dict result, keyed by path and sorted query string."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            if request.method != "GET":
                return view_func(request, *args, **kwargs)
            query = "&".join(f"{k}={v}" for k, v in sorted(request.GET.items()))[:300]
            key = f"public:{_version()}:{request.path}?{query}"
            hit = cache.get(key)
            if hit is not None:
                return hit
            result = view_func(request, *args, **kwargs)
            if isinstance(result, dict) and result.get("success"):
                cache.set(key, result, ttl)
            return result
        return wrapped
    return decorator
