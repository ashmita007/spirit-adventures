#!/usr/bin/env bash

echo "=== Starting Spirit Adventures Unified Platform ==="

# Set Render host & port defaults
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"
export DJANGO_API_URL="http://127.0.0.1:8000/api/v1"

# 1. Start Django API in background on 127.0.0.1:8000
echo "--> Launching Django API in background..."
(
  cd /app/backend
  python manage.py migrate --no-input || true
  python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spirit_backend.settings')
django.setup()
from adventures.models import Trip
if Trip.objects.count() == 0:
    try:
        from django.core.management import call_command
        call_command('seed_data')
    except Exception as e:
        pass
" || true
  gunicorn spirit_backend.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 1 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
) &

# 2. Launch Next.js IMMEDIATELY so Render health check passes instantly
echo "--> Launching Next.js Website on 0.0.0.0:$PORT..."
cd /app/frontend
exec npm start -- -p "$PORT"
