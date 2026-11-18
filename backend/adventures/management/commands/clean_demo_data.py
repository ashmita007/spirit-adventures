"""
Remove the demo content that seed_data adds, and merge duplicate packages.

Safe to run on every start: it only touches rows it recognises and never deletes
an enquiry or a customer review.

- Demo trips (exact seed slugs) are deleted. Their reviews move to the matching real
  package and their website enquiries are kept (the trip link is cleared).
- Duplicate packages (same title once case, spacing, "&" and known typos are ignored)
  are merged into the one with the most content; enquiries and reviews move across.
- Demo destinations and the CRM's demo packages go only once nothing uses them.
- CRM test enquiries with the placeholder number 9876543210 are deleted.

    python manage.py clean_demo_data            # apply
    python manage.py clean_demo_data --dry-run  # only report
"""

import re

from django.core.management.base import BaseCommand
from django.db import transaction

from adventures.models import Destination, Enquiry, Review, Trip

DEMO_TRIP_SLUGS = {
    'dandeli-river-rafting-jungle-expedition': '3d-2n-gokarna-dandeli',
    'gokarna-beach-cliff-trek': '3d-2n-gokarna-udipi',
    'coorg-tadiandamol-coffee-trail': '3d-2n-coorg',
    'chikmagalur-mullayanagiri-ridge-trek': '3d-2n-chickmangalur',
    'ooty-nilgiri-pine-forest-expedition': '3d-2n-ooty-coonoor',
    'wayanad-chembra-peak-waterfall-trail': '3d-2n-wayanad',
    'leh-ladakh-motorcycle-odyssey': None,
    'kedarkantha-trek': None,
}
DEMO_DESTINATION_SLUGS = {
    'uttarakhand', 'ladakh', 'himachal', 'kashmir', 'gokarna', 'dandeli',
    'coorg', 'chikmagalur', 'ooty', 'wayanad',
}
# Names the CRM demo seed used for its tour packages (never linked to a website trip).
DEMO_PACKAGE_NAMES = {
    'Kedarnath Yatra & Valley Trek', 'Spiti Valley 4x4 Overland Expedition',
    'Meghalaya Living Root Bridges & Caving', 'Gokarna Beach & Cliff Trek',
    'Manali & Hampta Pass Snow Trek', 'Wayanad Wildlife & Chembra Peak Trek',
    'Kashmir Great Lakes Expedition', 'Ladakh High Passes Bike Expedition',
    'Dandeli River Rafting & Jungle Camp', 'Coorg Coffee Plantation & Tadiandamol',
}
TEST_PHONE = '9876543210'
TYPOS = {'munnat': 'munnar', 'kodaikankal': 'kodaikanal'}


def title_key(title):
    words = re.sub(r'[^a-z0-9]+', ' ', (title or '').lower().replace('&', ' and ')).split()
    return ' '.join(TYPOS.get(w, w) for w in words)


def has_typo(text):
    return any(re.search(rf'\b{w}\b', (text or '').lower().replace('-', ' ')) for w in TYPOS)


def fix_typos(title):
    for wrong, right in TYPOS.items():
        title = re.sub(rf'\b{wrong}\b', lambda m: right.upper() if m.group(0).isupper() else right.capitalize(),
                       title, flags=re.IGNORECASE)
    return title


def content_score(trip):
    return (trip.gallery_images.count() + trip.itinerary_days.count()
            + trip.enquiries.count() + trip.reviews.count())


class Command(BaseCommand):
    help = "Remove seed demo content and merge duplicate packages. Never deletes enquiries or reviews."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true')

    def say(self, text):
        self.stdout.write(f"--> [clean] {text}")

    def handle(self, *args, dry_run=False, **options):
        with transaction.atomic():
            changed = self._clean()
            if dry_run:
                transaction.set_rollback(True)
        self.say(("Would change" if dry_run else "Changed") + f" {changed} rows." if changed else "Nothing to clean.")

    def _clean(self):
        changed = 0

        # 1. Demo trips
        for slug, real_slug in DEMO_TRIP_SLUGS.items():
            trip = Trip.objects.filter(slug=slug).first()
            if not trip:
                continue
            real = Trip.objects.filter(slug=real_slug).first() if real_slug else None
            moved = Review.objects.filter(trip=trip).update(trip=real)
            kept = Enquiry.objects.filter(trip=trip).update(trip=None)
            trip.delete()
            changed += 1
            self.say(f"demo trip removed: {trip.title} (reviews moved: {moved}, enquiries kept: {kept})")

        # 2. Duplicate packages
        groups = {}
        for trip in Trip.objects.all().order_by('id'):
            groups.setdefault(title_key(trip.title), []).append(trip)
        for same in groups.values():
            if len(same) < 2:
                continue
            keep = max(same, key=lambda t: (content_score(t), -t.id))
            clean_slug = None
            for dup in same:
                if dup.pk == keep.pk:
                    continue
                dup_id, dup_title, dup_slug = dup.pk, dup.title, dup.slug
                Review.objects.filter(trip=dup).update(trip=keep)
                Enquiry.objects.filter(trip=dup).update(trip=keep)
                dup.delete()
                changed += 1
                if not has_typo(dup_slug):
                    clean_slug = dup_slug
                self.say(f"duplicate merged: '{dup_title}' (#{dup_id}) into '{keep.title}' (#{keep.pk})")
            # Keep the content of the richer copy, but not its spelling mistakes.
            fixed_title = fix_typos(keep.title)
            if fixed_title != keep.title or (clean_slug and has_typo(keep.slug)):
                keep.title = fixed_title
                if clean_slug and has_typo(keep.slug):
                    keep.slug = clean_slug
                keep.save(update_fields=['title', 'slug'])
                self.say(f"title/link corrected: '{keep.title}' -> /trips/{keep.slug}")

        # 3. Demo destinations nothing uses (a destination delete would take its trips with it)
        for dest in Destination.objects.filter(slug__in=DEMO_DESTINATION_SLUGS):
            if not dest.trips.exists():
                dest.delete()
                changed += 1
                self.say(f"empty demo destination removed: {dest.name}")

        # 4. CRM demo data
        try:
            from crm.enquiries.models import Enquiry as CrmEnquiry, TourPackage
        except Exception:
            return changed
        n, _ = CrmEnquiry.objects.filter(contact__regex=rf'^(\+?91)?{TEST_PHONE}$').delete()
        if n:
            changed += n
            self.say(f"CRM test enquiries removed: {n}")
        live_slugs = set(Trip.objects.values_list('slug', flat=True))
        for pkg in TourPackage.objects.exclude(website_slug='').exclude(website_slug__isnull=True):
            if pkg.website_slug not in live_slugs and not pkg.enquiries.exists():
                pkg.delete()
                changed += 1
                self.say(f"CRM package for a removed trip deleted: {pkg.name}")
        for pkg in TourPackage.objects.filter(name__in=DEMO_PACKAGE_NAMES):
            if (pkg.website_slug or '').strip() or pkg.enquiries.exists():
                continue
            pkg.delete()
            changed += 1
            self.say(f"CRM demo package removed: {pkg.name}")
        return changed
