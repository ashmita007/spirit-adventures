"""Sliding-window rate limiter, per client IP and endpoint bucket.

State lives in this process. The site runs one gunicorn worker (several threads), so a lock
is enough; with more workers or servers, swap `limiter` for a shared store such as Redis.
"""
import threading
import time
from collections import defaultdict, deque
from functools import wraps

from django.http import HttpResponseBase, JsonResponse

_SWEEP_EVERY = 500      # requests between clean-ups of idle clients
_MAX_KEYS = 20000       # hard cap so a flood of spoofed IPs cannot exhaust memory
_LONGEST_WINDOW = 3600


class InMemoryRateLimiter:
    def __init__(self):
        self.requests = defaultdict(deque)  # "ip:bucket" -> request timestamps, oldest first
        self._lock = threading.Lock()
        self._calls = 0

    def is_allowed(self, key: str, max_requests: int, window_seconds: int):
        """Returns (allowed, remaining, seconds_until_reset)."""
        now = time.time()
        with self._lock:
            self._calls += 1
            if self._calls % _SWEEP_EVERY == 0 or len(self.requests) > _MAX_KEYS:
                self._sweep(now)
            stamps = self.requests[key]
            while stamps and stamps[0] <= now - window_seconds:
                stamps.popleft()
            allowed = len(stamps) < max_requests
            if allowed:
                stamps.append(now)
            reset_in = max(int(window_seconds - (now - stamps[0])), 1) if stamps else window_seconds
            return allowed, max(max_requests - len(stamps), 0), reset_in

    def _sweep(self, now: float) -> None:
        cutoff = now - _LONGEST_WINDOW
        for key in [k for k, v in self.requests.items() if not v or v[-1] <= cutoff]:
            del self.requests[key]
        if len(self.requests) > _MAX_KEYS:  # still too many: drop the least recently seen
            oldest = sorted(self.requests, key=lambda k: self.requests[k][-1])
            for key in oldest[: len(self.requests) - _MAX_KEYS]:
                del self.requests[key]

    def get_stats(self):
        now = time.time()
        with self._lock:
            buckets = {}
            total = 0
            for key, stamps in self.requests.items():
                recent = sum(1 for t in stamps if t > now - _LONGEST_WINDOW)
                if recent:
                    bucket = key.rsplit(":", 1)[-1]
                    buckets[bucket] = buckets.get(bucket, 0) + recent
                    total += recent
            return {
                "tracked_clients": len(self.requests),
                "total_recent_requests": total,
                "bucket_breakdown": buckets,
                "algorithms": "Sliding window per IP and endpoint",
                "active_protection": True,
            }


limiter = InMemoryRateLimiter()


def get_client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()[:64]
    return request.META.get('REMOTE_ADDR', '127.0.0.1')


def rate_limit(max_requests: int = 10, window_seconds: int = 60, bucket_name: str = "default"):
    """Decorator for API views: 429 with Retry-After once a client passes the limit."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            # The website's own server renders pages by calling this API over loopback with no
            # forwarded header. Those are not visitors, and Django is not reachable from outside.
            if not request.META.get('HTTP_X_FORWARDED_FOR') and request.META.get('REMOTE_ADDR') in ('127.0.0.1', '::1'):
                return view_func(request, *args, **kwargs)
            key = f"{get_client_ip(request)}:{bucket_name}"
            allowed, remaining, reset_in = limiter.is_allowed(key, max_requests, window_seconds)

            if not allowed:
                response = JsonResponse({
                    "success": False,
                    "data": None,
                    "message": f"Too many requests. Please wait {reset_in} seconds and try again.",
                    "errors": {"rate_limit": "Too Many Requests", "retry_after_seconds": reset_in},
                }, status=429)
                response['Retry-After'] = str(reset_in)
                response['X-RateLimit-Limit'] = str(max_requests)
                response['X-RateLimit-Remaining'] = "0"
                response['X-RateLimit-Reset'] = str(reset_in)
                return response

            response = view_func(request, *args, **kwargs)
            # Views usually return a dict (the framework builds the response); only real
            # response objects can carry headers.
            if isinstance(response, HttpResponseBase):
                response['X-RateLimit-Limit'] = str(max_requests)
                response['X-RateLimit-Remaining'] = str(remaining)
                response['X-RateLimit-Reset'] = str(reset_in)
            return response
        return wrapped_view
    return decorator
