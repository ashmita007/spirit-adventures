from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Destination, Category, Trip, TripImage, TripVideo,
    TripItinerary, Enquiry, Review, GalleryImage, BlogPost, FAQ
)

class TripImageInline(admin.TabularInline):
    model = TripImage
    extra = 1
    fields = ('image_url', 'caption', 'ordering', 'is_cover')

class TripVideoInline(admin.TabularInline):
    model = TripVideo
    extra = 1
    fields = ('video_url', 'poster_image', 'title', 'ordering')

class TripItineraryInline(admin.StackedInline):
    model = TripItinerary
    extra = 1
    fields = ('day_number', 'title', 'description', 'altitude', 'distance', 'meals', 'stay_type')

class FAQInline(admin.TabularInline):
    model = FAQ
    extra = 1
    fields = ('question', 'answer', 'category', 'is_published')


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'subtitle', 'is_featured', 'is_published', 'ordering', 'preview_cover')
    list_filter = ('is_featured', 'is_published')
    search_fields = ('name', 'subtitle', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_featured', 'is_published', 'ordering')

    def preview_cover(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="width: 55px; height: 38px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />', obj.cover_image)
        return "-"
    preview_cover.short_description = "Cover"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon', 'ordering', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('icon', 'ordering', 'is_published')


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('title', 'destination', 'category', 'difficulty', 'duration_display', 'price_display', 'is_featured', 'is_bestseller', 'is_published', 'preview_cover')
    list_filter = ('destination', 'category', 'difficulty', 'is_featured', 'is_bestseller', 'is_published')
    search_fields = ('title', 'short_description', 'full_description', 'pickup_location')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_featured', 'is_bestseller', 'is_published')
    inlines = [TripImageInline, TripVideoInline, TripItineraryInline, FAQInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'destination', 'category', 'short_description', 'full_description')
        }),
        ('Duration & Difficulty', {
            'fields': (('duration_days', 'duration_nights'), 'difficulty', ('price', 'original_price'))
        }),
        ('Trek & Logistics Details', {
            'fields': (('pickup_location', 'drop_location'), ('altitude', 'trek_distance'), 'best_season')
        }),
        ('Media Assets', {
            'fields': ('cover_image', 'hero_video_url')
        }),
        ('Curated Content (JSON lists)', {
            'fields': ('inclusions', 'exclusions', 'things_to_carry'),
            'classes': ('collapse',)
        }),
        ('Flags & SEO', {
            'fields': (('is_featured', 'is_bestseller', 'is_published'), 'ordering', 'meta_title', 'meta_description')
        }),
    )

    def duration_display(self, obj):
        return obj.duration_label
    duration_display.short_description = "Duration"

    def price_display(self, obj):
        return f"₹{obj.price:,.0f}"
    price_display.short_description = "Price (INR)"

    def preview_cover(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="width: 55px; height: 38px; object-fit: cover; border-radius: 6px;" />', obj.cover_image)
        return "-"
    preview_cover.short_description = "Cover"


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone_actions', 'email', 'trip_name', 'departure_city', 'travelers_count', 'priority', 'status', 'follow_up_date', 'created_at')
    list_filter = ('status', 'priority', 'departure_city', 'created_at', 'trip')
    search_fields = ('full_name', 'phone', 'email', 'message', 'admin_notes', 'departure_city')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('status', 'priority')
    actions = ['mark_contacted', 'mark_follow_up', 'mark_payment_pending', 'mark_converted', 'mark_closed']

    def trip_name(self, obj):
        return obj.trip.title if obj.trip else "General Adventure Enquiry"
    trip_name.short_description = "Requested Trip"

    def priority_badge(self, obj):
        colors = {
            'HIGH': '#EF4444',
            'MEDIUM': '#F59E0B',
            'LOW': '#64748B',
        }
        color = colors.get(obj.priority, '#64748B')
        icon = '🔥 VIP' if obj.priority == 'HIGH' else ('⚡ Med' if obj.priority == 'MEDIUM' else '💤 Low')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 10px; display: inline-block;">{}</span>',
            color, icon
        )
    priority_badge.short_description = "Priority"

    def phone_actions(self, obj):
        clean_phone = "".join(filter(str.isdigit, obj.phone))
        wa_url = f"https://wa.me/{clean_phone}?text=Hi%20{obj.full_name}%2C%20greetings%20from%20Spirit%20Adventures!"
        return format_html(
            '<div style="white-space: nowrap;"><strong>{}</strong><br/><a href="{}" target="_blank" style="color: #059669; text-decoration: none; font-size: 11px; font-weight: 600;">💬 WhatsApp</a> &bull; <a href="tel:{}" style="color: #0284c7; text-decoration: none; font-size: 11px; font-weight: 600;">📞 Call</a></div>',
            obj.phone, wa_url, obj.phone
        )
    phone_actions.short_description = "Customer Contact"

    def status_badge(self, obj):
        colors = {
            'NEW': '#0284C7',
            'CONTACTED': '#F59E0B',
            'FOLLOW_UP': '#8B5CF6',
            'PAYMENT_PENDING': '#EA580C',
            'CONVERTED': '#10B981',
            'CLOSED': '#64748B',
        }
        color = colors.get(obj.status, '#64748B')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Pipeline Status"

    @admin.action(description="📞 Mark selected as Contacted")
    def mark_contacted(self, request, queryset):
        queryset.update(status='CONTACTED')

    @admin.action(description="⏳ Mark selected as Follow-Up Required")
    def mark_follow_up(self, request, queryset):
        queryset.update(status='FOLLOW_UP')

    @admin.action(description="💳 Mark selected as Payment Pending")
    def mark_payment_pending(self, request, queryset):
        queryset.update(status='PAYMENT_PENDING')

    @admin.action(description="🎉 Mark selected as Converted / Booking Confirmed")
    def mark_converted(self, request, queryset):
        queryset.update(status='CONVERTED')

    @admin.action(description="📁 Mark selected as Closed")
    def mark_closed(self, request, queryset):
        queryset.update(status='CLOSED')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('traveler_name', 'trip', 'rating_stars', 'traveler_location', 'travel_date', 'is_verified', 'is_featured', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'is_featured', 'is_verified', 'rating', 'trip')
    search_fields = ('traveler_name', 'review_text', 'traveler_location')
    list_editable = ('is_featured', 'is_approved')
    actions = ['approve_reviews', 'reject_reviews', 'mark_featured']

    def rating_stars(self, obj):
        return format_html(
            '<span style="color: #F59E0B; font-weight: bold; font-size: 14px;">{}</span>',
            "★" * obj.rating + "☆" * (5 - obj.rating)
        )
    rating_stars.short_description = "Rating"

    @admin.action(description="✅ Approve selected reviews")
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description="❌ Reject / Unapprove selected reviews")
    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)

    @admin.action(description="⭐ Feature selected reviews on Homepage")
    def mark_featured(self, request, queryset):
        queryset.update(is_featured=True, is_approved=True)


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'location', 'ordering', 'is_featured', 'is_published', 'preview_thumb')
    list_filter = ('category', 'is_featured', 'is_published')
    search_fields = ('title', 'caption', 'location')
    list_editable = ('ordering', 'is_featured', 'is_published')

    def preview_thumb(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" style="width: 55px; height: 38px; object-fit: cover; border-radius: 6px;" />', obj.image_url)
        return "-"
    preview_thumb.short_description = "Preview"


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'reading_time', 'is_featured', 'is_published', 'published_at', 'preview_cover')
    list_filter = ('category', 'is_featured', 'is_published')
    search_fields = ('title', 'excerpt', 'content', 'author')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_featured', 'is_published')

    def reading_time(self, obj):
        return f"{obj.reading_time_minutes} min read"
    reading_time.short_description = "Read Time"

    def preview_cover(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" style="width: 55px; height: 38px; object-fit: cover; border-radius: 6px;" />', obj.cover_image)
        return "-"
    preview_cover.short_description = "Cover"


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'trip', 'ordering', 'is_published')
    list_filter = ('category', 'is_published', 'trip')
    search_fields = ('question', 'answer')
    list_editable = ('ordering', 'is_published')
