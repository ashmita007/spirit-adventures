"""Copy new enquiries and changed trips into the built-in CRM after the DB commit."""
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from . import crm
from .models import Enquiry, Trip


@receiver(post_save, sender=Enquiry)
def enquiry_to_crm(sender, instance, created, raw=False, **kwargs):
    if created and not raw:
        transaction.on_commit(lambda: crm.push_enquiry(instance))


@receiver(post_save, sender=Trip)
def trip_to_crm(sender, instance, raw=False, **kwargs):
    if not raw:
        transaction.on_commit(lambda: crm.push_trips([instance]))
