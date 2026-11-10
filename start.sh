#!/usr/bin/env bash
set -e

echo "=== Starting Spirit Adventures Unified Platform ==="

# Set Render host & port defaults
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=256}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="/app/backend"
if [ ! -d "$BACKEND_DIR" ]; then
  BACKEND_DIR="$SCRIPT_DIR/backend"
fi
FRONTEND_DIR="/app/frontend"
if [ ! -d "$FRONTEND_DIR" ]; then
  FRONTEND_DIR="$SCRIPT_DIR/frontend"
fi

export PYTHONPATH="${BACKEND_DIR}:${PYTHONPATH}"
export DJANGO_SETTINGS_MODULE="spirit_backend.settings"
export BACKEND_URL="http://127.0.0.1:8000"
export DJANGO_API_URL="http://127.0.0.1:8000/api/v1"
export INTERNAL_API_URL="http://127.0.0.1:8000/api/v1"

# 1. Fast database migrations
echo "--> Applying database migrations..."
python "$BACKEND_DIR/manage.py" migrate --no-input

# 1b. First start on a real database (DATABASE_URL set, e.g. Postgres): copy the
#     bundled SQLite data (trips, leads, CRM users, gallery...) in once. Runs only
#     while the database has no trips, so it never overwrites live data.
if [ -n "${DATABASE_URL:-}" ] && [ -f "$BACKEND_DIR/db.sqlite3" ]; then
  TRIP_COUNT=$(python "$BACKEND_DIR/manage.py" shell -c "from adventures.models import Trip; print(Trip.objects.count())" 2>/dev/null | tail -1)
  if [ "$TRIP_COUNT" = "0" ]; then
    echo "--> Empty database: importing bundled SQLite data..."
    EXPORT_DIR="$(mktemp -d /tmp/sqlite-export-XXXXXX)"; EXPORT_FILE="$EXPORT_DIR/import.json"
    if DATABASE_URL="sqlite:///$BACKEND_DIR/db.sqlite3" python "$BACKEND_DIR/manage.py" dumpdata \
         --natural-foreign --natural-primary \
         -e contenttypes -e auth.permission -e admin.logentry -e sessions > "$EXPORT_FILE" \
       && python "$BACKEND_DIR/manage.py" loaddata "$EXPORT_FILE"; then
      echo "--> Import done."
    else
      echo "--> Import FAILED; starting with the empty database." >&2
    fi
    rm -rf "$EXPORT_DIR"
  fi
fi

# 2. Launch Gunicorn Django Server on 127.0.0.1:8000 (1 worker, 4 threads to fit safely inside 512MB RAM)
echo "--> Launching Gunicorn Django Server on 127.0.0.1:8000..."
gunicorn spirit_backend.wsgi:application \
  --chdir "$BACKEND_DIR" \
  --bind 127.0.0.1:8000 \
  --workers 1 \
  --threads 4 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - &

GUNICORN_PID=$!
echo "--> Gunicorn started with PID $GUNICORN_PID"

# 3. Clean shutdown trap
cleanup() {
  echo "--> Shutting down services cleanly..."
  kill -TERM "$GUNICORN_PID" 2>/dev/null || true
  if [ -n "${NEXT_PID:-}" ]; then
    kill -TERM "$NEXT_PID" 2>/dev/null || true
    wait "$NEXT_PID" 2>/dev/null || true
  fi
  wait "$GUNICORN_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGTERM SIGINT EXIT

# 4. Launch Next.js Frontend on 0.0.0.0:$PORT immediately so Render port binding succeeds within seconds
echo "--> Launching Next.js Website on 0.0.0.0:$PORT..."
cd "$FRONTEND_DIR"
npm start -- -p "$PORT" &
NEXT_PID=$!
echo "--> Next.js started with PID $NEXT_PID"

# 5. Background asynchronous tasks (superuser, demo seed, CRM sync)
(
  # Wait for Django to respond
  for i in $(seq 1 30); do
    if curl -s -o /dev/null http://127.0.0.1:8000/api/v1/health/; then
      break
    fi
    sleep 0.2
  done

  # Owner account from DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD (create or update)
  python "$BACKEND_DIR/manage.py" ensure_owner || echo "--> Owner account setup FAILED" >&2

  # Demo trips only on an empty database if requested
  if [ "${SEED_DEMO_DATA:-0}" = "1" ]; then
    python "$BACKEND_DIR/manage.py" seed_data >/dev/null 2>&1 || true
  fi

  # Sync packages with CRM
  echo "--> Syncing packages with CRM in background..."
  python "$BACKEND_DIR/manage.py" sync_crm >/dev/null 2>&1 || true
  echo "--> Background initialization completed."
) &

echo "--> Both web tiers are active. Monitoring processes..."
wait -n "$GUNICORN_PID" "$NEXT_PID" 2>/dev/null || wait "$NEXT_PID"
EXIT_CODE=$?
echo "--> Process exited with code $EXIT_CODE. Checking status..."
if ! kill -0 "$GUNICORN_PID" 2>/dev/null; then
  echo "--> Gunicorn exited!"
fi
if ! kill -0 "$NEXT_PID" 2>/dev/null; then
  echo "--> Next.js exited!"
fi
