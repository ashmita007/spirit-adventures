"""
Save the database to GitHub automatically after it changes (see github_db_backup.py).

Any create, update or delete marks the database dirty. A save runs once things
have been quiet for QUIET_SECONDS, and at the latest MAX_WAIT_SECONDS after the
first unsaved change, so a busy site still saves regularly. A last save runs when
the process shuts down (Render stops an instance with SIGTERM before replacing it).
"""

import atexit
import logging
import threading
import time

import github_db_backup

logger = logging.getLogger(__name__)

QUIET_SECONDS = 60
URGENT_QUIET_SECONDS = 5         # e.g. a customer enquiry: save it almost at once
MAX_WAIT_SECONDS = 300
FIRST_SAVE_DELAY = 90            # after start, so a new deploy's copy is saved
IGNORED_APPS = {'sessions', 'admin', 'contenttypes'}

_db_path = None
_urgent_models = set()
_lock = threading.Lock()
_dirty_since = None
_last_change = 0.0
_urgent = False
_wake = threading.Event()


def _save():
    global _dirty_since, _last_change, _urgent
    with _lock:
        _dirty_since = None
        _urgent = False
    try:
        github_db_backup.push(_db_path)
    except Exception as exc:  # never break the site over a backup
        logger.error('[db-backup] save failed: %s', exc)
        with _lock:  # try again on the next round
            _dirty_since = _dirty_since or time.time()
            _last_change = time.time()


def _loop():
    time.sleep(FIRST_SAVE_DELAY)
    _save()
    while True:
        _wake.wait(15)
        _wake.clear()
        with _lock:
            since, last, urgent = _dirty_since, _last_change, _urgent
        if since is None:
            continue
        now = time.time()
        quiet = URGENT_QUIET_SECONDS if urgent else QUIET_SECONDS
        if urgent and now - last < quiet:
            time.sleep(quiet - (now - last))
            now = time.time()
        if now - last >= quiet or now - since >= MAX_WAIT_SECONDS:
            _save()


def _on_change(sender, **kwargs):
    global _dirty_since, _last_change, _urgent
    if kwargs.get('raw') or sender._meta.app_label in IGNORED_APPS:
        return
    with _lock:
        now = time.time()
        _dirty_since = _dirty_since or now
        _last_change = now
        if sender._meta.label in _urgent_models:
            _urgent = True
    if sender._meta.label in _urgent_models:
        _wake.set()


def _on_exit():
    if _dirty_since is not None:
        try:
            github_db_backup.push(_db_path)
        except Exception as exc:
            logger.error('[db-backup] final save failed: %s', exc)


def start(db_path, urgent_models=()):
    """
    Call once per process from AppConfig.ready(). Does nothing without the settings.
    urgent_models: labels like 'adventures.Enquiry' that are saved within seconds.
    """
    global _db_path
    if _db_path is not None or not github_db_backup.enabled():
        return
    _db_path = str(db_path)
    _urgent_models.update(urgent_models)
    from django.db.models.signals import m2m_changed, post_delete, post_save
    post_save.connect(_on_change, dispatch_uid='db_autobackup_save')
    post_delete.connect(_on_change, dispatch_uid='db_autobackup_delete')
    m2m_changed.connect(_on_change, dispatch_uid='db_autobackup_m2m')
    atexit.register(_on_exit)
    threading.Thread(target=_loop, name='db-autobackup', daemon=True).start()
    logger.info('[db-backup] automatic saves on for %s', _db_path)
