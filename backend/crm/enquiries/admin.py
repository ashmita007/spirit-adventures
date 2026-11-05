from django.contrib import admin

from .models import Enquiry, EnquiryComment, TourPackage


@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    list_display = ("name", "destination", "duration_days", "base_price", "is_active", "website_slug")
    list_filter = ("is_active", "destination")
    search_fields = ("name", "destination", "website_slug")


class CommentInline(admin.TabularInline):
    model = EnquiryComment
    extra = 0
    fields = ("author", "call_status", "comment_text", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Enquiry)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("name", "contact", "tour_package", "date_of_travel", "status", "sales_person", "payment_status", "source")
    list_filter = ("status", "source", "payment_status", "sales_person")
    search_fields = ("name", "contact", "email", "pnr_up", "pnr_down")
    date_hierarchy = "date_of_travel"
    autocomplete_fields = ("tour_package",)
    raw_id_fields = ("sales_person",)
    readonly_fields = ("balance_amount", "payment_status", "external_ref", "created_at", "updated_at")
    inlines = [CommentInline]
