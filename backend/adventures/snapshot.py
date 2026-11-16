"""
Keep the live database across deploys (same idea as KashiiUpdatez's live pull).

The site runs on the SQLite file inside the container, and every deploy starts from the
file baked into the image. On Render the old instance keeps serving until the new one is
healthy, so the new container downloads the live database from it first
(scripts/carryover_db.py, run by start.sh before migrations).

  GET /api/v1/internal/db-snapshot/   header X-Carryover-Token  -> gzipped SQLite file
  GET /api/v1/owner/backup/download/  staff session             -> same file, for offsite copies

The token is an HMAC of SECRET_KEY, which both the old and new instance share, so no
extra secret has to be configured.
"""
import gzip
import hashlib
import hmac
import os
import shutil
import sqlite3
import tempfile

from django.conf import settings
from django.db import connection
from django.http import FileResponse, JsonResponse
from django.utils import timezone
from ninja import Router
from ninja.security import SessionAuthIsStaff

from .ratelimit import rate_limit

public_router = Router(tags=["Internal"])
owner_router = Router(auth=SessionAuthIsStaff(), tags=["Owner Backup"])


def carryover_token(secret: str) -> str:
    return hmac.new(secret.encode(), b"spirit-db-carryover-v1", hashlib.sha256).hexdigest()


def _sqlite_path():
    if connection.vendor != "sqlite":
        return None
    return str(settings.DATABASES["default"]["NAME"])


def _gzipped_copy() -> str:
    """Consistent copy of the live SQLite file (safe while the site is writing), gzipped."""
    src_path = _sqlite_path()
    fd, raw = tempfile.mkstemp(suffix=".sqlite3")
    os.close(fd)
    src = sqlite3.connect(src_path, timeout=30)
    dst = sqlite3.connect(raw)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    gz = raw + ".gz"
    with open(raw, "rb") as fin, gzip.open(gz, "wb", compresslevel=6) as fout:
        shutil.copyfileobj(fin, fout)
    os.remove(raw)
    return gz


class _DeleteAfterSend(FileResponse):
    def __init__(self, path, **kw):
        self._tmp = path
        super().__init__(open(path, "rb"), **kw)

    def close(self):
        super().close()
        try:
            os.remove(self._tmp)
        except OSError:
            pass


def _file_response(filename: str):
    gz = _gzipped_copy()
    resp = _DeleteAfterSend(gz, as_attachment=True, filename=filename, content_type="application/gzip")
    resp["Cache-Control"] = "no-store"
    return resp


@public_router.get("/db-snapshot/", include_in_schema=False)
@rate_limit(max_requests=10, window_seconds=600, bucket_name="db_snapshot")
def db_snapshot(request):
    given = request.headers.get("X-Carryover-Token", "")
    if not given or not hmac.compare_digest(given, carryover_token(settings.SECRET_KEY)):
        return JsonResponse({"success": False, "message": "Forbidden"}, status=403)
    if not _sqlite_path():
        return JsonResponse({"success": False, "message": "Not a SQLite database"}, status=409)
    return _file_response("spirit-live.sqlite3.gz")


@owner_router.get("/backup/download/")
def owner_backup_download(request):
    if not _sqlite_path():
        return JsonResponse({"success": False, "message": "Backups here only cover the built-in SQLite database."}, status=409)
    stamp = timezone.localtime().strftime("%Y-%m-%d_%H%M")
    return _file_response(f"spirit-adventures-backup_{stamp}.sqlite3.gz")
