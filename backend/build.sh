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
