#!/usr/bin/env bash

echo "=== Starting Spirit Adventures Unified Platform ==="

# Set Render host & port defaults
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"
export DJANGO_API_URL="http://127.0.0.1:8000/api/v1"

# 1. Start Django Gunicorn immediately on 127.0.0.1:8000
echo "--> Launching Gunicorn Django Server on 127.0.0.1:8000..."
gunicorn spirit_backend.wsgi:application \
  --chdir /app/backend \
  --bind 127.0.0.1:8000 \
  --workers 1 \
  --threads 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - &

GUNICORN_PID=$!
echo "--> Gunicorn started with PID $GUNICORN_PID"

# 2. Run migrations & seeding asynchronously
(
  cd /app/backend
  python manage.py migrate --no-input || true
  python manage.py seed_data || true
) &

# 3. Launch Next.js Frontend on 0.0.0.0:$PORT
echo "--> Launching Next.js Website on 0.0.0.0:$PORT..."
cd /app/frontend
exec npm start -- -p "$PORT"
