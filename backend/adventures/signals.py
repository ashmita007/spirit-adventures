"""Copy new enquiries and changed trips into the built-in CRM after the DB commit."""
from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from . import crm
from .cache import invalidate_public_cache
from .models import (
    BlogPost, Category, Destination, Enquiry, FAQ, GalleryImage, Review,
    Trip, TripImage, TripItinerary, TripVideo,
)


@receiver(post_save, sender=Enquiry)
def enquiry_to_crm(sender, instance, created, raw=False, **kwargs):
    if created and not raw:
        transaction.on_commit(lambda: crm.push_enquiry(instance))


@receiver(post_save, sender=Trip)
def trip_to_crm(sender, instance, raw=False, **kwargs):
    if not raw:
        transaction.on_commit(lambda: crm.push_trips([instance]))


# Anything shown on the public site: drop the cached API responses when it changes
for _model in (Destination, Category, Trip, TripImage, TripVideo, TripItinerary,
               Review, GalleryImage, BlogPost, FAQ):
    post_save.connect(invalidate_public_cache, sender=_model, dispatch_uid=f"cache-save-{_model.__name__}")
    post_delete.connect(invalidate_public_cache, sender=_model, dispatch_uid=f"cache-delete-{_model.__name__}")
