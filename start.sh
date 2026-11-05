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

  # First owner account (only created if credentials supplied)
  if [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
    echo "--> Ensuring owner account ${DJANGO_SUPERUSER_EMAIL} exists..."
    python "$BACKEND_DIR/manage.py" createsuperuser --noinput >/dev/null 2>&1 \
      && echo "--> Owner account ${DJANGO_SUPERUSER_EMAIL} created" \
      || echo "--> Owner account already exists"
  fi

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
