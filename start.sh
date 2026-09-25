#!/usr/bin/env bash
set -e

echo "=== Starting Spirit Adventures Unified Platform ==="

# 1. Run migrations and ensure database is ready
cd /app/backend
python manage.py migrate --no-input

# Auto-seed if empty
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spirit_backend.settings')
django.setup()
from adventures.models import Review
if Review.objects.count() == 0:
    try:
        import update_reviews
        update_reviews.update_reviews()
    except Exception as e:
        print('Seed error:', e)
" || true

# 2. Start Django Gunicorn on internal loopback port 8000
echo "--> Launching Django Ninja API on internal port 8000..."
gunicorn spirit_backend.wsgi:application \
  --bind 127.0.0.1:8000 \
  --workers 1 \
  --threads 2 \
  --timeout 120 &

# 3. Start Next.js Frontend on Render's assigned $PORT
cd /app/frontend
export PORT=${PORT:-3000}
export DJANGO_API_URL="http://127.0.0.1:8000/api/v1"
echo "--> Launching Next.js Website on external port $PORT..."
exec npm start -- -p $PORT
