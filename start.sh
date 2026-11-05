#!/usr/bin/env bash
set -e

echo "=== Starting Spirit Adventures Unified Platform ==="

# Set Render host & port defaults
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"

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

# 1. Run migrations & CRM setup synchronously before accepting traffic
echo "--> Applying database migrations..."
python "$BACKEND_DIR/manage.py" migrate --no-input

# First owner account (only created if credentials supplied)
if [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  echo "--> Ensuring owner account ${DJANGO_SUPERUSER_EMAIL} exists..."
  python "$BACKEND_DIR/manage.py" createsuperuser --noinput >/dev/null 2>&1 \
    && echo "--> Owner account ${DJANGO_SUPERUSER_EMAIL} created" \
    || echo "--> Owner account already exists"
fi

# Demo trips only on an empty database if requested
if [ "${SEED_DEMO_DATA:-0}" = "1" ]; then
  echo "--> Checking demo trips..."
  python "$BACKEND_DIR/manage.py" seed_data || true
fi

# Sync packages with CRM
echo "--> Syncing packages with CRM..."
python "$BACKEND_DIR/manage.py" sync_crm || true

# 2. Launch Gunicorn Django Server on 127.0.0.1:8000
echo "--> Launching Gunicorn Django Server on 127.0.0.1:8000..."
gunicorn spirit_backend.wsgi:application \
  --chdir "$BACKEND_DIR" \
  --bind 127.0.0.1:8000 \
  --workers 2 \
  --threads 4 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - &

GUNICORN_PID=$!
echo "--> Gunicorn started with PID $GUNICORN_PID"

# Quick loop waiting for Gunicorn to be ready (takes ~0.3s)
echo "--> Waiting for Django API to respond..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://127.0.0.1:8000/api/v1/health/; then
    echo "--> Django API is ready and healthy!"
    break
  fi
  sleep 0.2
done

# Clean shutdown trap
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

# 3. Launch Next.js Frontend on 0.0.0.0:$PORT
echo "--> Launching Next.js Website on 0.0.0.0:$PORT..."
cd "$FRONTEND_DIR"
npm start -- -p "$PORT" &
NEXT_PID=$!

wait -n "$GUNICORN_PID" "$NEXT_PID" 2>/dev/null || wait "$NEXT_PID"
