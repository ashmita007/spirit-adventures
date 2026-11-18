"""
Keep a SQLite database safe on a host whose disk resets (Render free instances).

The whole database is copied (sqlite3 backup API, so the copy is consistent while
the site is writing), gzipped and committed to a private GitHub repository branch
as a single commit that replaces the previous one, so the branch never grows.
On start the newest copy is put back before the app opens the database.

Standard library only: it runs before Django starts.

Environment:
    GITHUB_BACKUP_TOKEN    fine-grained token, Contents read/write on the backup repo
    GITHUB_BACKUP_REPO     owner/name of the private backup repository
    GITHUB_BACKUP_BRANCH   one branch per app, e.g. kashiiupdatez
    RENDER_GIT_COMMIT      set by Render; marks which build a copy came from

Command line:
    python github_db_backup.py restore DB_PATH   # put back the newer copy, if any
    python github_db_backup.py push DB_PATH      # save the database now
"""

import base64
import gzip
import hashlib
import json
import os
import shutil
import sqlite3
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

API = 'https://api.github.com'
DB_FILE = 'db.sqlite3.gz'
META_FILE = 'meta.json'
TIMEOUT = 60


class BackupError(Exception):
    pass


def config():
    return {
        'token': os.environ.get('GITHUB_BACKUP_TOKEN', '').strip(),
        'repo': os.environ.get('GITHUB_BACKUP_REPO', '').strip(),
        'branch': os.environ.get('GITHUB_BACKUP_BRANCH', '').strip(),
        'build': os.environ.get('RENDER_GIT_COMMIT', '').strip() or 'local',
    }


def enabled():
    cfg = config()
    return bool(cfg['token'] and cfg['repo'] and cfg['branch'])


def log(message):
    print(f'==> [db-backup] {message}', file=sys.stderr, flush=True)


# ---------------------------------------------------------------- GitHub API

def _request(method, path, body=None, accept='application/vnd.github+json', ok=(200, 201)):
    cfg = config()
    data = json.dumps(body).encode('utf-8') if body is not None else None
    req = urllib.request.Request(f'{API}{path}', data=data, method=method, headers={
        'Authorization': f"Bearer {cfg['token']}",
        'Accept': accept,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'db-backup',
        **({'Content-Type': 'application/json'} if data else {}),
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            raw = resp.read()
            status = resp.status
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return 404, None
        raise BackupError(f'GitHub {method} {path}: HTTP {exc.code} {exc.read()[:200]!r}') from None
    except urllib.error.URLError as exc:
        raise BackupError(f'GitHub {method} {path}: {exc.reason}') from None
    if status not in ok:
        raise BackupError(f'GitHub {method} {path}: HTTP {status}')
    if accept.endswith('raw') or accept.endswith('raw+json'):
        return status, raw
    return status, json.loads(raw or b'null')


def _repo_path():
    return f"/repos/{config()['repo']}"


def remote_meta():
    """The newest copy's details, or None when nothing has been saved yet."""
    cfg = config()
    status, raw = _request('GET', f"{_repo_path()}/contents/{META_FILE}?ref={cfg['branch']}",
                           accept='application/vnd.github.raw')
    if status == 404:
        return None
    return json.loads(raw)


def _download_db():
    cfg = config()
    status, raw = _request('GET', f"{_repo_path()}/contents/{DB_FILE}?ref={cfg['branch']}",
                           accept='application/vnd.github.raw')
    if status == 404:
        raise BackupError('backup file missing')
    return raw


def _upload(gz_bytes, meta):
    """One parentless commit holding the two files; the branch is moved to it."""
    cfg = config()
    blobs = {}
    for name, content in ((DB_FILE, gz_bytes), (META_FILE, json.dumps(meta, indent=1).encode())):
        _, blob = _request('POST', f'{_repo_path()}/git/blobs', {
            'content': base64.b64encode(content).decode('ascii'), 'encoding': 'base64'})
        blobs[name] = blob['sha']
    _, tree = _request('POST', f'{_repo_path()}/git/trees', {'tree': [
        {'path': name, 'mode': '100644', 'type': 'blob', 'sha': sha} for name, sha in blobs.items()]})
    _, commit = _request('POST', f'{_repo_path()}/git/commits', {
        'message': f"backup {meta['saved_at']} ({meta['build'][:7]})", 'tree': tree['sha'], 'parents': []})
    ref = f"heads/{cfg['branch']}"
    status, _ = _request('GET', f'{_repo_path()}/git/ref/{ref}')
    if status == 404:
        _request('POST', f'{_repo_path()}/git/refs', {'ref': f'refs/{ref}', 'sha': commit['sha']})
    else:
        _request('PATCH', f'{_repo_path()}/git/refs/{ref}', {'sha': commit['sha'], 'force': True})


# ---------------------------------------------------------------- local state

def _state_path(db_path):
    return f'{db_path}.backup-state.json'


def local_state(db_path):
    try:
        with open(_state_path(db_path)) as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


def _write_state(db_path, meta):
    with open(_state_path(db_path), 'w') as handle:
        json.dump({'saved_at': meta['saved_at'], 'build': meta['build'], 'sha256': meta['sha256']}, handle)


def _now():
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ')


# ---------------------------------------------------------------- push / restore

def snapshot(db_path):
    """A consistent gzipped copy of the live database, and its sha256."""
    fd, tmp = tempfile.mkstemp(suffix='.sqlite3')
    os.close(fd)
    try:
        src = sqlite3.connect(db_path, timeout=30)
        dst = sqlite3.connect(tmp)
        try:
            src.backup(dst)
        finally:
            dst.close()
            src.close()
        with open(tmp, 'rb') as handle:
            raw = handle.read()
    finally:
        os.unlink(tmp)
    return gzip.compress(raw, compresslevel=6, mtime=0), hashlib.sha256(raw).hexdigest()


def push(db_path):
    """Save the database. Returns False when it has not changed since the last save."""
    if not enabled():
        return False
    gz_bytes, digest = snapshot(db_path)
    if local_state(db_path).get('sha256') == digest:
        return False
    meta = {'saved_at': _now(), 'build': config()['build'], 'sha256': digest,
            'size': len(gz_bytes), 'host': os.environ.get('RENDER_INSTANCE_ID', '')}
    _upload(gz_bytes, meta)
    _write_state(db_path, meta)
    log(f"saved {len(gz_bytes) // 1024} KB to {config()['repo']}@{config()['branch']}")
    return True


def restore(db_path):
    """
    Put back the saved copy when it is newer than what this disk holds.
    Returns the copy's meta when it was restored, else None.
    """
    if not enabled():
        log('GITHUB_BACKUP_TOKEN / REPO / BRANCH not set: skipping restore')
        return None
    meta = remote_meta()
    if not meta:
        log('no backup saved yet')
        return None
    mine = local_state(db_path)
    if mine.get('saved_at', '') >= meta['saved_at']:
        log(f"database is current (saved {mine.get('saved_at')})")
        return None

    raw = gzip.decompress(_download_db())
    if hashlib.sha256(raw).hexdigest() != meta['sha256']:
        raise BackupError('downloaded copy does not match its checksum')
    folder = os.path.dirname(os.path.abspath(db_path))
    fd, tmp = tempfile.mkstemp(dir=folder, suffix='.restore')
    with os.fdopen(fd, 'wb') as handle:
        handle.write(raw)
    conn = sqlite3.connect(tmp)
    try:
        ok = conn.execute('PRAGMA quick_check').fetchone()
    finally:
        conn.close()
    if not ok or ok[0] != 'ok':
        os.unlink(tmp)
        raise BackupError(f'downloaded copy failed quick_check: {ok}')
    if os.path.exists(db_path):
        shutil.copy2(db_path, f'{db_path}.before-restore')
    for side in ('-wal', '-shm', '-journal'):
        try:
            os.unlink(db_path + side)
        except FileNotFoundError:
            pass
    os.replace(tmp, db_path)
    _write_state(db_path, meta)
    log(f"restored copy saved {meta['saved_at']} (build {meta['build'][:7]}, {len(raw) // 1024} KB)")
    return meta


def main(argv):
    if len(argv) != 3 or argv[1] not in ('restore', 'push'):
        print(__doc__)
        return 2
    action, db_path = argv[1], argv[2]
    for attempt in range(3):
        try:
            if action == 'restore':
                restore(db_path)
            else:
                log('saved' if push(db_path) else 'unchanged, nothing to save')
            return 0
        except BackupError as exc:
            log(f'{action} failed (attempt {attempt + 1}/3): {exc}')
            time.sleep(2 * (attempt + 1))
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv))
