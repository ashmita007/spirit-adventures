from django.core.management.base import BaseCommand

from adventures.models import GalleryImage


class Command(BaseCommand):
    help = "Re-add Cloudinary gallery uploads missing from the database (after a reset)."

    def add_arguments(self, parser):
        parser.add_argument("--if-reset", action="store_true",
                            help="Only run when the gallery has no Cloudinary photos (fresh/reset database)")

    def handle(self, *args, **opts):
        if opts["if_reset"] and GalleryImage.objects.filter(image_url__contains="res.cloudinary.com").exists():
            self.stdout.write("Gallery already has Cloudinary photos; nothing to recover.")
            return
        from adventures.recovery import recover
        try:
            res = recover(add_gallery=True)
        except Exception as exc:
            self.stderr.write(f"Upload recovery skipped: {exc}")
            return
        self.stdout.write(f"Restored {len(res['gallery_added'])} gallery photos; "
                          f"{len(res['other_uploads'])} other uploads listed in Owner HQ -> Gallery.")
