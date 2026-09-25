#!/usr/bin/env bash

echo "=== Starting Spirit Adventures Unified Platform ==="

# Set Render host & port defaults
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"
export DJANGO_API_URL="http://127.0.0.1:8000/api/v1"

# 1. Run migrations and database seeding
echo "--> Initializing database..."
cd /app/backend
python manage.py migrate --no-input || echo "Migration notice (proceeding)..."

python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spirit_backend.settings')
django.setup()
from adventures.models import Trip
if Trip.objects.count() == 0:
    try:
        from django.core.management import call_command
        call_command('seed_data')
        print('Database successfully seeded with Cloudinary packages.')
    except Exception as e:
        print('Seed notice:', e)
else:
    print(f'Database has {Trip.objects.count()} trips.')
" || true

# 2. Start Django Gunicorn on internal loopback port 8000
echo "--> Launching Django API on 127.0.0.1:8000..."
gunicorn spirit_backend.wsgi:application \
  --bind 127.0.0.1:8000 \
  --workers 1 \
  --threads 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - &

# Brief sleep to allow Gunicorn socket to bind
sleep 1

# 3. Start Next.js Frontend bound to 0.0.0.0:$PORT
echo "--> Launching Next.js Website on 0.0.0.0:$PORT..."
cd /app/frontend
exec ./node_modules/.bin/next start -H 0.0.0.0 -p "$PORT"
