#!/usr/bin/env python3
"""
Run by start.sh before migrations: replace the SQLite file baked into the image with the
live one from the instance that is still serving, so a deploy never wipes leads, CRM data,
trips, gallery or team edits. See adventures/snapshot.py.

Exit 0 = continue starting (database carried over, or nothing to carry).
Exit 1 = stop. On Render a failed start keeps the old instance (and its data) live.
Escape hatch if the live site is really gone: set SKIP_DB_CARRYOVER=1 for one deploy.
"""
import gzip
import hashlib
import hmac
import os
import shutil
import sqlite3
import sys
import tempfile
import time
import urllib.error
import urllib.request

DB_PATH = sys.argv[1] if len(sys.argv) > 1 else "/app/backend/db.sqlite3"
SOURCE = os.environ.get("CARRYOVER_SOURCE_URL", "https://www.spiritadventures.in").rstrip("/")
ATTEMPTS = int(os.environ.get("CARRYOVER_ATTEMPTS", "5"))


def log(msg):
    print(f"--> [db carry-over] {msg}", flush=True)


def main() -> int:
    if os.environ.get("DATABASE_URL"):
        log("DATABASE_URL is set, data already lives outside the container. Skipping.")
        return 0
    if os.environ.get("SKIP_DB_CARRYOVER") == "1":
        log("SKIP_DB_CARRYOVER=1: starting from the database in the image.")
        return 0
    if not (os.environ.get("RENDER") or os.environ.get("CARRYOVER_SOURCE_URL")):
        log("Not on Render and no CARRYOVER_SOURCE_URL. Skipping.")
        return 0
    if os.environ.get("SECRET_KEY_GENERATED") == "1":
        log("SECRET_KEY is not configured, so the live site can't be authenticated. Skipping.")
        return 0

    token = hmac.new(os.environ["SECRET_KEY"].encode(), b"spirit-db-carryover-v1", hashlib.sha256).hexdigest()
    url = f"{SOURCE}/api/v1/internal/db-snapshot/"
    tmpdir = tempfile.mkdtemp(prefix="carryover-")
    gz_path = os.path.join(tmpdir, "live.sqlite3.gz")
    raw_path = os.path.join(tmpdir, "live.sqlite3")

    for attempt in range(1, ATTEMPTS + 1):
        try:
            log(f"Downloading live database from {SOURCE} (attempt {attempt}/{ATTEMPTS})...")
            req = urllib.request.Request(url, headers={"X-Carryover-Token": token, "User-Agent": "spirit-deploy"})
            # Generous timeout: a sleeping free instance takes a while to wake up.
            with urllib.request.urlopen(req, timeout=150) as resp, open(gz_path, "wb") as out:
                shutil.copyfileobj(resp, out)
            break
        except urllib.error.HTTPError as e:
            if e.code == 404:
                log("Live site has no carry-over endpoint yet (first deploy with this feature). Using the image database.")
                return 0
            if e.code == 409:
                log("Live site is not on SQLite. Nothing to carry over.")
                return 0
            if e.code == 403:
                log("Live site rejected the token (SECRET_KEY changed?). Refusing to start so live data is not lost.")
                log("Fix SECRET_KEY, or set SKIP_DB_CARRYOVER=1 for one deploy if you accept starting fresh.")
                return 1
            log(f"HTTP {e.code}")
        except Exception as e:  # network / timeout / sleeping instance
            log(f"Failed: {e}")
        if attempt == ATTEMPTS:
            log("Could not reach the live site. Refusing to start so live data is not lost.")
            log("Render keeps the old instance running. Set SKIP_DB_CARRYOVER=1 only if the old site is really gone.")
            return 1
        time.sleep(10)

    with gzip.open(gz_path, "rb") as fin, open(raw_path, "wb") as fout:
        shutil.copyfileobj(fin, fout)
    with open(raw_path, "rb") as f:
        if f.read(16) != b"SQLite format 3\x00":
            log("Downloaded file is not a SQLite database. Refusing to start.")
            return 1
    conn = sqlite3.connect(raw_path)
    try:
        ok = conn.execute("PRAGMA quick_check;").fetchone()
        has_trips = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='adventures_trip'").fetchone()
        leads = conn.execute("SELECT COUNT(*) FROM adventures_enquiry").fetchone()[0] if has_trips else 0
    finally:
        conn.close()
    if not ok or ok[0] != "ok" or not has_trips:
        log(f"Downloaded database failed checks ({ok}). Refusing to start.")
        return 1

    if os.path.exists(DB_PATH):
        shutil.copy2(DB_PATH, DB_PATH + ".bundled")
    for ext in ("-wal", "-shm", "-journal"):
        try:
            os.remove(DB_PATH + ext)
        except OSError:
            pass
    shutil.move(raw_path, DB_PATH)
    shutil.rmtree(tmpdir, ignore_errors=True)
    log(f"Live database carried over ({leads} website leads). Migrations run next.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
