from django.contrib import admin

from .models import MonthlyTarget


@admin.register(MonthlyTarget)
class MonthlyTargetAdmin(admin.ModelAdmin):
    list_display = ("year", "month", "sales_person", "target_amount")
    list_filter = ("year", "month")
    raw_id_fields = ("sales_person",)
