#!/bin/sh
# Runs before gunicorn: wait for Postgres, migrate, first-run setup. Safe to run on every start.
set -e

echo "[entrypoint] waiting for database..."
python - <<'PY'
import os, sys, time
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "spirit_backend.settings")
django.setup()
from django.db import connection
for i in range(60):
    try:
        connection.ensure_connection()
        print("[entrypoint] database is up")
        sys.exit(0)
    except Exception as e:
        print(f"[entrypoint] db not ready ({e.__class__.__name__}), retry {i + 1}/60")
        time.sleep(2)
sys.exit("[entrypoint] database never came up")
PY

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  python manage.py migrate --no-input
fi

# First owner account (only created if that email does not exist yet)
if [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  python manage.py createsuperuser --noinput >/dev/null 2>&1 \
    && echo "[entrypoint] owner account ${DJANGO_SUPERUSER_EMAIL} created" \
    || echo "[entrypoint] owner account already exists"
fi

# Demo trips only on an empty database (seed_data refuses to touch existing trips)
if [ "${SEED_DEMO_DATA:-0}" = "1" ]; then
  python manage.py seed_data
fi

python manage.py sync_crm || echo "[entrypoint] CRM sync skipped"

exec "$@"
