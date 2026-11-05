from django.apps import AppConfig

class AdventuresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adventures'
    verbose_name = 'Spirit Adventures Core'

    def ready(self):
        from . import signals  # noqa: F401  (CRM sync hooks)
