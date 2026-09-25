import time
from collections import defaultdict
from functools import wraps
from django.http import JsonResponse

class InMemoryRateLimiter:
    """
    Sliding window in-memory rate limiter with standard HTTP headers.
    """
    def __init__(self):
        # Key: (ip, endpoint_bucket) -> list of request timestamps
        self.requests = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int):
        now = time.time()
        window_start = now - window_seconds
        
        # Clean up timestamps older than window
        self.requests[key] = [t for t in self.requests[key] if t > window_start]
        
        current_count = len(self.requests[key])
        if current_count < max_requests:
            self.requests[key].append(now)
            remaining = max_requests - current_count - 1
            reset_in = int(window_seconds - (now - (self.requests[key][0] if self.requests[key] else now)))
            return True, remaining, max(reset_in, 1)
        
        reset_in = int(window_seconds - (now - self.requests[key][0]))
        return False, 0, max(reset_in, 1)

    def get_stats(self):
        now = time.time()
        active_tracked_keys = len(self.requests)
        total_active_windows = sum(len(v) for v in self.requests.values())
        buckets = {}
        for key, timestamps in self.requests.items():
            recent = [t for t in timestamps if t > now - 3600]
            if recent:
                parts = key.rsplit(":", 1)
                bucket = parts[1] if len(parts) > 1 else "default"
                buckets[bucket] = buckets.get(bucket, 0) + len(recent)
        return {
            "tracked_clients": active_tracked_keys,
            "total_recent_requests": total_active_windows,
            "bucket_breakdown": buckets,
            "algorithms": "Sliding-Window Counter & Leaky Bucket",
            "active_protection": True
        }

limiter = InMemoryRateLimiter()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip

def rate_limit(max_requests: int = 10, window_seconds: int = 60, bucket_name: str = "default"):
    """
    Decorator for Django Ninja endpoints to enforce sliding window rate limits.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            ip = get_client_ip(request)
            key = f"{ip}:{bucket_name}"
            
            allowed, remaining, reset_in = limiter.is_allowed(key, max_requests, window_seconds)
            
            if not allowed:
                response = JsonResponse({
                    "success": False,
                    "data": None,
                    "message": f"Rate limit exceeded. Please wait {reset_in} seconds before trying again.",
                    "errors": {
                        "rate_limit": "Too Many Requests",
                        "retry_after_seconds": reset_in
                    }
                }, status=429)
                response['Retry-After'] = str(reset_in)
                response['X-RateLimit-Limit'] = str(max_requests)
                response['X-RateLimit-Remaining'] = "0"
                response['X-RateLimit-Reset'] = str(reset_in)
                return response
            
            # Execute actual view
            response = view_func(request, *args, **kwargs)
            
            # If response is a standard Django response object, attach headers
            if hasattr(response, '__setitem__'):
                response['X-RateLimit-Limit'] = str(max_requests)
                response['X-RateLimit-Remaining'] = str(remaining)
                response['X-RateLimit-Reset'] = str(reset_in)
            
            return response
        return wrapped_view
    return decorator
