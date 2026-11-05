#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Seed verified reviews and trips if database is fresh
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spirit_backend.settings')
django.setup()
from adventures.models import Trip, Review
if Review.objects.count() == 0:
    try:
        import update_reviews
        update_reviews.update_reviews()
    except Exception as e:
        print('Review seed error:', e)
"

# Owner account for the merged portal + CRM (set these env vars on the host once).
# DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_FIRST_NAME, DJANGO_SUPERUSER_LAST_NAME
if [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  python manage.py createsuperuser --noinput 2>/dev/null || echo "Owner account already exists"
fi

# Mirror website trips into the CRM package list
python manage.py sync_crm || echo "CRM sync skipped"
