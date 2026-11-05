from django.core.management.base import BaseCommand

from adventures import crm
from adventures.models import Enquiry, Trip


class Command(BaseCommand):
    help = "Copy all trips and any not-yet-synced website enquiries into the built-in CRM."

    def add_arguments(self, parser):
        parser.add_argument("--all", action="store_true", help="Re-send every enquiry, not just unsynced ones")

    def handle(self, *args, **opts):
        trips = list(Trip.objects.select_related("destination"))
        self.stdout.write(f"Packages: {crm.push_trips(trips)}")

        qs = Enquiry.objects.select_related("trip")
        if not opts["all"]:
            qs = qs.filter(crm_synced_at__isnull=True)
        ok = fail = 0
        for e in qs:
            if crm.push_enquiry(e):
                ok += 1
            else:
                fail += 1
        self.stdout.write(self.style.SUCCESS(f"Enquiries synced: {ok}, failed: {fail}"))
