"""
Create or update the owner (admin) account from environment variables.

    DJANGO_SUPERUSER_EMAIL     login email for /owner and /crm
    DJANGO_SUPERUSER_PASSWORD  its password (set in the Render dashboard only)

Runs on every start, so the dashboard value is the source of truth: changing
the password in Render and restarting resets it. Does nothing if either is unset,
and refuses passwords that fail Django's validators (length, common, numeric).
"""
import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update the owner account from DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD."

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip().lower()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")
        if not email or not password:
            self.stdout.write("Owner account: DJANGO_SUPERUSER_EMAIL / PASSWORD not set, skipped.")
            return

        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()
        created = user is None
        if created:
            user = User(email=email, first_name="Owner", last_name="")

        try:
            validate_password(password, user)
        except ValidationError as exc:
            self.stderr.write("Owner account NOT saved, password too weak: " + " ".join(exc.messages))
            return

        user.set_password(password)
        user.role = "admin"
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.is_approved = True
        user.save()
        self.stdout.write(f"Owner account {'created' if created else 'updated'}: {email}")
