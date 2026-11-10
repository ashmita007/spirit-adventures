"""Page-number pagination for list endpoints.

`page` is optional so existing callers that expect the full list keep working. When `page`
is sent, the response gains a `pagination` block and only that page is read from the database.
"""
from typing import Optional

DEFAULT_PAGE_SIZE = 12
MAX_PAGE_SIZE = 60


def paginate(queryset, page: Optional[int], page_size: Optional[int]):
    """Return (rows, pagination | None). Slices the queryset, so the DB does LIMIT/OFFSET."""
    if page is None:
        return queryset, None
    size = max(1, min(page_size or DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE))
    total = queryset.count()
    total_pages = max(1, -(-total // size))
    page = max(1, min(page, total_pages))
    start = (page - 1) * size
    return queryset[start:start + size], {
        "page": page,
        "page_size": size,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
    }
