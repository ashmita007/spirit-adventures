import sys

from django.apps import AppConfig

class AdventuresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adventures'
    verbose_name = 'Spirit Adventures Core'

    def ready(self):
        from . import signals  # noqa: F401  (CRM sync hooks)

        # Save the database to GitHub after changes, in the web server only (start.sh
        # also runs one-off manage.py commands that must not start the saver).
        if 'manage.py' in (sys.argv[0] if sys.argv else ''):
            return
        try:
            from django.conf import settings
            import db_autobackup
            db = settings.DATABASES['default']
            if db['ENGINE'].endswith('sqlite3'):
                db_autobackup.start(db['NAME'], urgent_models=('adventures.Enquiry', 'enquiries.Enquiry'))
        except Exception:
            pass
