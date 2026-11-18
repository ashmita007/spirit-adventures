#!/bin/bash
# Full local end-to-end run on a throwaway copy of the database.
#   bash frontend/e2e/run.sh
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="${E2E_WORK:-$(mktemp -d)}"
PY="$(ls "$ROOT/venv/bin/python" 2>/dev/null || echo python3)"
cp "$ROOT/backend/db.sqlite3" "$WORK/db.sqlite3"
cat > "$WORK/e2e_settings.py" <<PYEOF
from spirit_backend.settings import *  # noqa
DATABASES['default']['NAME'] = '$WORK/db.sqlite3'
DEBUG = True
ALLOWED_HOSTS = ['*']
PYEOF
export PYTHONPATH="$WORK" DJANGO_SETTINGS_MODULE=e2e_settings GITHUB_BACKUP_TOKEN=
cd "$ROOT/backend"
"$PY" manage.py migrate --noinput >/dev/null
"$PY" manage.py clean_demo_data
E2E_OWNER_EMAIL="e2e-owner@example.test"
E2E_OWNER_PASSWORD="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20)"
"$PY" manage.py shell -c "
from django.contrib.auth import get_user_model
U=get_user_model(); U.objects.filter(email='$E2E_OWNER_EMAIL').delete()
U.objects.create_user('$E2E_OWNER_EMAIL', '$E2E_OWNER_PASSWORD', is_staff=True, is_superuser=True)" >/dev/null
"$PY" manage.py runserver 127.0.0.1:8000 --noreload >"$WORK/backend.log" 2>&1 &
BACK=$!
cd "$ROOT/frontend"
PORT=3100 npx next dev -p 3100 >"$WORK/frontend.log" 2>&1 &
FRONT=$!
trap 'kill $BACK $FRONT 2>/dev/null; pkill -f "next dev -p 3100" 2>/dev/null' EXIT
until curl -s -o /dev/null http://127.0.0.1:8000/api/v1/trips/; do sleep 1; done
until curl -s -o /dev/null http://127.0.0.1:3100/; do sleep 1; done
# warm the dev compiler so timings in the test are real
for p in / /offers /trips /owner/login /owner/offers /about /contact; do curl -s -o /dev/null "http://127.0.0.1:3100$p"; done
E2E_DB="$WORK/db.sqlite3" E2E_OWNER_EMAIL="$E2E_OWNER_EMAIL" E2E_OWNER_PASSWORD="$E2E_OWNER_PASSWORD" E2E_SHOTS="$WORK" \
  node e2e/e2e.mjs
STATUS=$?
echo "logs and screenshots: $WORK"
exit $STATUS
