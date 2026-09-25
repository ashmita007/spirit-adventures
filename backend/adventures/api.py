from ninja import NinjaAPI, Router, Schema
from typing import List, Optional
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from .models import (
    Destination, Category, Trip, TripImage, TripVideo, 
    TripItinerary, Enquiry, Review, GalleryImage, BlogPost, FAQ
)
from .schemas import (
    ApiResponse, DestinationOut, CategoryOut, TripListOut,
    TripDetailOut, EnquiryIn, EnquiryOut, ReviewOut,
    GalleryImageOut, BlogPostListOut, BlogPostDetailOut,
    TriggerCronIn, ToggleCronIn
)
from .ratelimit import rate_limit, limiter
from .cron import CRON_JOB_REGISTRY, execute_cron_job

api = NinjaAPI(
    title="Spirit Adventures API",
    version="1.0.0",
    description="Cinematic nature and adventure travel API",
    urls_namespace="spirit_api"
)

# ----------------- Health -----------------
@api.get("/health/", response=ApiResponse, tags=["Health"])
@rate_limit(max_requests=60, window_seconds=60, bucket_name="health_check")
def health_check(request):
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "service": "Spirit Adventures API",
            "version": "1.0.0"
        },
        "message": "Spirit Adventures API is operational"
    }

# ----------------- Trips -----------------
@api.get("/trips/", response=ApiResponse, tags=["Trips"])
@rate_limit(max_requests=120, window_seconds=60, bucket_name="public_trips")
def list_trips(
    request,
    destination: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None
):
    queryset = Trip.objects.filter(is_published=True).select_related('destination', 'category')
    
    if destination:
        queryset = queryset.filter(destination__slug=destination)
    if category:
        queryset = queryset.filter(category__slug=category)
    if difficulty:
        queryset = queryset.filter(difficulty=difficulty.upper())
    if featured is not None:
        queryset = queryset.filter(is_featured=featured)
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(short_description__icontains=search) |
            Q(destination__name__icontains=search)
        )
    
    trips_data = []
    for t in queryset:
        trips_data.append({
            "id": t.id,
            "title": t.title,
            "slug": t.slug,
            "destination_name": t.destination.name,
            "destination_slug": t.destination.slug,
            "category_name": t.category.name if t.category else None,
            "category_slug": t.category.slug if t.category else None,
            "short_description": t.short_description,
            "duration_days": t.duration_days,
            "duration_nights": t.duration_nights,
            "duration_label": t.duration_label,
            "difficulty": t.difficulty,
            "price": float(t.price),
            "original_price": float(t.original_price) if t.original_price else None,
            "cover_image": t.cover_image,
            "hero_video_url": t.hero_video_url or "",
            "altitude": t.altitude,
            "trek_distance": t.trek_distance,
            "is_featured": t.is_featured,
            "is_bestseller": t.is_bestseller,
            "rating": 4.9,
            "reviews_count": t.reviews.filter(is_approved=True).count() or 18
        })
    
    return {
        "success": True,
        "data": trips_data,
        "message": f"Found {len(trips_data)} adventures"
    }

@api.get("/trips/{slug}/", response=ApiResponse, tags=["Trips"])
def get_trip(request, slug: str):
    try:
        t = Trip.objects.select_related('destination', 'category').prefetch_related(
            'gallery_images', 'videos', 'itinerary_days', 'faqs', 'reviews'
        ).get(slug=slug, is_published=True)
    except Trip.DoesNotExist:
        return api.create_response(
            request,
            {"success": False, "data": None, "message": "Trip not found", "errors": {"slug": "Not found"}},
            status=404
        )
    
    gallery_images = [
        {"id": img.id, "image_url": img.image_url, "caption": img.caption, "ordering": img.ordering, "is_cover": img.is_cover}
        for img in t.gallery_images.all()
    ]
    videos = [
        {"id": vid.id, "video_url": vid.video_url, "poster_image": vid.poster_image, "title": vid.title}
        for vid in t.videos.all()
    ]
    itinerary_days = [
        {
            "id": it.id,
            "day_number": it.day_number,
            "title": it.title,
            "description": it.description,
            "altitude": it.altitude,
            "distance": it.distance,
            "meals": it.meals,
            "stay_type": it.stay_type
        }
        for it in t.itinerary_days.all()
    ]
    faqs = [
        {"id": f.id, "question": f.question, "answer": f.answer, "category": f.category}
        for f in t.faqs.filter(is_published=True)
    ]
    reviews = [
        {
            "id": r.id,
            "traveler_name": r.traveler_name,
            "traveler_location": r.traveler_location,
            "avatar_url": r.avatar_url,
            "rating": r.rating,
            "review_text": r.review_text,
            "travel_date": r.travel_date,
            "is_verified": r.is_verified,
            "is_featured": r.is_featured,
            "trip_title": t.title
        }
        for r in t.reviews.filter(is_approved=True)
    ]

    data = {
        "id": t.id,
        "title": t.title,
        "slug": t.slug,
        "destination": {
            "id": t.destination.id,
            "name": t.destination.name,
            "slug": t.destination.slug,
            "subtitle": t.destination.subtitle,
            "description": t.destination.description,
            "cover_image": t.destination.cover_image,
            "hero_image": t.destination.hero_image,
            "is_featured": t.destination.is_featured
        },
        "category": {
            "id": t.category.id,
            "name": t.category.name,
            "slug": t.category.slug,
            "icon": t.category.icon,
            "description": t.category.description
        } if t.category else None,
        "short_description": t.short_description,
        "full_description": t.full_description,
        "duration_days": t.duration_days,
        "duration_nights": t.duration_nights,
        "duration_label": t.duration_label,
        "difficulty": t.difficulty,
        "price": float(t.price),
        "original_price": float(t.original_price) if t.original_price else None,
        "pickup_location": t.pickup_location,
        "drop_location": t.drop_location,
        "altitude": t.altitude,
        "trek_distance": t.trek_distance,
        "best_season": t.best_season,
        "cover_image": t.cover_image,
        "hero_video_url": t.hero_video_url,
        "inclusions": t.inclusions,
        "exclusions": t.exclusions,
        "things_to_carry": t.things_to_carry,
        "is_featured": t.is_featured,
        "is_bestseller": t.is_bestseller,
        "meta_title": t.meta_title,
        "meta_description": t.meta_description,
        "gallery_images": gallery_images,
        "videos": videos,
        "itinerary_days": itinerary_days,
        "faqs": faqs,
        "reviews": reviews,
        "rating": 4.9,
        "reviews_count": len(reviews) if len(reviews) > 0 else 24
    }

    return {"success": True, "data": data, "message": "Trip details retrieved successfully"}

# ----------------- Destinations -----------------
@api.get("/destinations/", response=ApiResponse, tags=["Destinations"])
def list_destinations(request, featured: Optional[bool] = None):
    queryset = Destination.objects.filter(is_published=True).annotate(
        trip_count=Count('trips', filter=Q(trips__is_published=True))
    )
    if featured is not None:
        queryset = queryset.filter(is_featured=featured)
    
    dest_data = []
    for d in queryset:
        dest_data.append({
            "id": d.id,
            "name": d.name,
            "slug": d.slug,
            "subtitle": d.subtitle,
            "description": d.description,
            "cover_image": d.cover_image,
            "hero_image": d.hero_image,
            "is_featured": d.is_featured,
            "trip_count": d.trip_count
        })
    
    return {"success": True, "data": dest_data, "message": f"Found {len(dest_data)} destinations"}

@api.get("/destinations/{slug}/", response=ApiResponse, tags=["Destinations"])
def get_destination(request, slug: str):
    try:
        d = Destination.objects.annotate(
            trip_count=Count('trips', filter=Q(trips__is_published=True))
        ).get(slug=slug, is_published=True)
    except Destination.DoesNotExist:
        return api.create_response(
            request,
            {"success": False, "data": None, "message": "Destination not found", "errors": {"slug": "Not found"}},
            status=404
        )
    
    # Get trips in this destination
    trips = Trip.objects.filter(destination=d, is_published=True).select_related('category')
    trips_data = [
        {
            "id": t.id,
            "title": t.title,
            "slug": t.slug,
            "destination_name": d.name,
            "destination_slug": d.slug,
            "category_name": t.category.name if t.category else None,
            "category_slug": t.category.slug if t.category else None,
            "short_description": t.short_description,
            "duration_days": t.duration_days,
            "duration_nights": t.duration_nights,
            "duration_label": t.duration_label,
            "difficulty": t.difficulty,
            "price": float(t.price),
            "original_price": float(t.original_price) if t.original_price else None,
            "cover_image": t.cover_image,
            "altitude": t.altitude,
            "trek_distance": t.trek_distance,
            "is_featured": t.is_featured,
            "is_bestseller": t.is_bestseller,
            "rating": 4.9,
            "reviews_count": 18
        }
        for t in trips
    ]
    
    data = {
        "id": d.id,
        "name": d.name,
        "slug": d.slug,
        "subtitle": d.subtitle,
        "description": d.description,
        "cover_image": d.cover_image,
        "hero_image": d.hero_image,
        "is_featured": d.is_featured,
        "trip_count": d.trip_count,
        "trips": trips_data
    }
    
    return {"success": True, "data": data, "message": "Destination details retrieved successfully"}

# ----------------- Categories -----------------
@api.get("/categories/", response=ApiResponse, tags=["Categories"])
def list_categories(request):
    categories = Category.objects.filter(is_published=True)
    data = [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "icon": c.icon,
            "description": c.description
        }
        for c in categories
    ]
    return {"success": True, "data": data, "message": f"Found {len(data)} categories"}

# ----------------- Enquiries -----------------
@api.post("/enquiries/", response=ApiResponse, tags=["Enquiries"])
@rate_limit(max_requests=10, window_seconds=60, bucket_name="enquiries_submit")
def create_enquiry(request, payload: EnquiryIn):
    trip = None
    if payload.trip_slug:
        trip = Trip.objects.filter(slug=payload.trip_slug).first()
    elif payload.trip_id:
        trip = Trip.objects.filter(id=payload.trip_id).first()

    if not payload.full_name or not payload.phone or not payload.email:
        return api.create_response(
            request,
            {
                "success": False,
                "data": None,
                "message": "Please provide full name, phone number, and email address.",
                "errors": {"fields": "Required fields missing"}
            },
            status=400
        )

    enquiry = Enquiry.objects.create(
        trip=trip,
        full_name=payload.full_name.strip(),
        email=payload.email.strip().lower(),
        phone=payload.phone.strip(),
        travel_date=payload.travel_date or "",
        travelers_count=payload.travelers_count or 1,
        message=payload.message or "",
        status='NEW'
    )

    return {
        "success": True,
        "data": {
            "id": enquiry.id,
            "full_name": enquiry.full_name,
            "email": enquiry.email,
            "phone": enquiry.phone,
            "trip_title": trip.title if trip else "Custom Adventure",
            "status": enquiry.status,
            "created_at": enquiry.created_at
        },
        "message": "Thank you! Our adventure team will contact you shortly."
    }

# ----------------- Reviews -----------------
@api.get("/reviews/", response=ApiResponse, tags=["Reviews"])
def list_reviews(request, featured_only: Optional[bool] = None, trip_slug: Optional[str] = None):
    queryset = Review.objects.filter(is_approved=True).select_related('trip')
    if featured_only:
        queryset = queryset.filter(is_featured=True)
    if trip_slug:
        queryset = queryset.filter(trip__slug=trip_slug)
        
    reviews_data = [
        {
            "id": r.id,
            "traveler_name": r.traveler_name,
            "traveler_location": r.traveler_location,
            "avatar_url": r.avatar_url,
            "rating": r.rating,
            "review_text": r.review_text,
            "travel_date": r.travel_date,
            "is_verified": r.is_verified,
            "is_featured": r.is_featured,
            "trip_title": r.trip.title if r.trip else "Spirit Adventure"
        }
        for r in queryset
    ]
    return {"success": True, "data": reviews_data, "message": f"Found {len(reviews_data)} reviews"}

# ----------------- Gallery -----------------
@api.get("/gallery/", response=ApiResponse, tags=["Gallery"])
def list_gallery(request, category: Optional[str] = None, featured_only: Optional[bool] = None):
    queryset = GalleryImage.objects.filter(is_published=True)
    if category and category.lower() != 'all':
        queryset = queryset.filter(category__iexact=category)
    if featured_only:
        queryset = queryset.filter(is_featured=True)
        
    data = [
        {
            "id": g.id,
            "title": g.title,
            "category": g.category,
            "image_url": g.image_url,
            "caption": g.caption,
            "location": g.location,
            "is_featured": g.is_featured
        }
        for g in queryset
    ]
    return {"success": True, "data": data, "message": f"Found {len(data)} gallery items"}

# ----------------- Blog -----------------
@api.get("/blog/", response=ApiResponse, tags=["Blog"])
def list_blogs(request, featured_only: Optional[bool] = None):
    queryset = BlogPost.objects.filter(is_published=True)
    if featured_only:
        queryset = queryset.filter(is_featured=True)
        
    data = [
        {
            "id": b.id,
            "title": b.title,
            "slug": b.slug,
            "excerpt": b.excerpt,
            "cover_image": b.cover_image,
            "author": b.author,
            "category": b.category,
            "reading_time_minutes": b.reading_time_minutes,
            "published_at": b.published_at
        }
        for b in queryset
    ]
    return {"success": True, "data": data, "message": f"Found {len(data)} blog articles"}

@api.get("/blog/{slug}/", response=ApiResponse, tags=["Blog"])
def get_blog(request, slug: str):
    try:
        b = BlogPost.objects.get(slug=slug, is_published=True)
    except BlogPost.DoesNotExist:
        return api.create_response(
            request,
            {"success": False, "data": None, "message": "Blog post not found", "errors": {"slug": "Not found"}},
            status=404
        )
        
    data = {
        "id": b.id,
        "title": b.title,
        "slug": b.slug,
        "excerpt": b.excerpt,
        "content": b.content,
        "cover_image": b.cover_image,
        "author": b.author,
        "category": b.category,
        "reading_time_minutes": b.reading_time_minutes,
        "meta_title": b.meta_title,
        "meta_description": b.meta_description,
        "published_at": b.published_at
    }
    return {"success": True, "data": data, "message": "Blog article retrieved successfully"}

# ----------------- Owner & Business Dashboard -----------------
class UpdateEnquiryStatusIn(Schema):
    status: str
    admin_notes: Optional[str] = None

class UpdateTripConfigIn(Schema):
    price: Optional[float] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None

@api.get("/owner/overview/", response=ApiResponse, tags=["Owner"])
def get_owner_overview(request):
    enquiries = Enquiry.objects.select_related('trip').order_by('-created_at')
    trips = Trip.objects.select_related('destination').all()
    reviews = Review.objects.all()

    total_leads = enquiries.count()
    converted_leads = enquiries.filter(status='CONVERTED').count()
    new_leads = enquiries.filter(status='NEW').count()
    in_pipeline = enquiries.filter(status__in=['CONTACTED', 'FOLLOW_UP']).count()
    
    conversion_rate = round((converted_leads / total_leads * 100), 1) if total_leads > 0 else 0

    # Calculate estimated revenue from converted bookings
    est_revenue = 0
    for e in enquiries.filter(status='CONVERTED'):
        if e.trip:
            est_revenue += float(e.trip.price) * (e.travelers_count or 1)
        else:
            est_revenue += 15000.0 * (e.travelers_count or 1)

    enquiry_list = []
    for e in enquiries:
        enquiry_list.append({
            "id": e.id,
            "full_name": e.full_name,
            "email": e.email,
            "phone": e.phone,
            "travel_date": e.travel_date,
            "travelers_count": e.travelers_count,
            "message": e.message,
            "status": e.status,
            "priority": e.priority,
            "departure_city": e.departure_city,
            "follow_up_date": e.follow_up_date,
            "admin_notes": e.admin_notes,
            "trip_title": e.trip.title if e.trip else "General Consultation",
            "trip_slug": e.trip.slug if e.trip else "",
            "trip_price": float(e.trip.price) if e.trip else 0,
            "created_at": e.created_at.strftime("%b %d, %Y - %I:%M %p")
        })

    trip_list = []
    for t in trips:
        trip_list.append({
            "id": t.id,
            "title": t.title,
            "slug": t.slug,
            "destination_name": t.destination.name,
            "price": float(t.price),
            "duration_days": t.duration_days,
            "duration_nights": t.duration_nights,
            "duration_label": t.duration_label,
            "difficulty": t.difficulty,
            "cover_image": t.cover_image,
            "hero_video_url": t.hero_video_url,
            "is_featured": t.is_featured,
            "is_bestseller": t.is_bestseller,
            "is_published": t.is_published,
            "leads_count": t.enquiries.count()
        })

    data = {
        "metrics": {
            "total_leads": total_leads,
            "converted_leads": converted_leads,
            "new_leads": new_leads,
            "in_pipeline": in_pipeline,
            "conversion_rate": conversion_rate,
            "est_revenue": est_revenue,
            "active_trips_count": trips.filter(is_published=True).count(),
            "approved_reviews_count": reviews.filter(is_approved=True).count()
        },
        "enquiries": enquiry_list,
        "trips": trip_list,
        "config": {
            "whatsapp_number": "+91 98765 43210",
            "support_email": "hello@spiritadventures.in",
            "currency": "INR",
            "brand_name": "Spirit Adventures"
        }
    }

    return {"success": True, "data": data, "message": "Owner dashboard data retrieved"}

class CreateLeadIn(Schema):
    full_name: str
    phone: str
    email: Optional[str] = ""
    trip_title: Optional[str] = "Dandeli Kali River White Water Rafting"
    travelers_count: Optional[int] = 1
    travel_date: Optional[str] = "Upcoming Weekend"
    priority: Optional[str] = "MEDIUM"
    status: Optional[str] = "NEW"
    departure_city: Optional[str] = "Bengaluru"
    follow_up_date: Optional[str] = "Tomorrow 11:00 AM"
    admin_notes: Optional[str] = ""

@api.post("/owner/leads/create/", response=ApiResponse, tags=["Owner"])
def create_owner_lead(request, payload: CreateLeadIn):
    trip = None
    if payload.trip_title:
        trip = Trip.objects.filter(title__icontains=payload.trip_title.split()[0]).first()

    lead = Enquiry.objects.create(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email or f"{payload.full_name.lower().replace(' ', '')}@example.com",
        trip=trip,
        travelers_count=payload.travelers_count or 1,
        travel_date=payload.travel_date or "",
        departure_city=payload.departure_city or "Bengaluru",
        priority=payload.priority or "MEDIUM",
        status=payload.status or "NEW",
        follow_up_date=payload.follow_up_date or "",
        admin_notes=payload.admin_notes or "Ingested via Owner CRM",
        message="Created from Owner CRM desk."
    )

    return {
        "success": True,
        "data": {
            "id": lead.id,
            "full_name": lead.full_name,
            "phone": lead.phone,
            "status": lead.status,
            "priority": lead.priority
        },
        "message": f"Lead for {lead.full_name} created successfully"
    }

@api.post("/owner/enquiries/{enquiry_id}/status/", response=ApiResponse, tags=["Owner"])
def update_owner_enquiry_status(request, enquiry_id: int, payload: UpdateEnquiryStatusIn):
    enquiry = get_object_or_404(Enquiry, id=enquiry_id)
    if payload.status:
        enquiry.status = payload.status
    if payload.admin_notes is not None:
        enquiry.admin_notes = payload.admin_notes
    enquiry.save()

    return {
        "success": True,
        "data": {
            "id": enquiry.id,
            "status": enquiry.status,
            "admin_notes": enquiry.admin_notes
        },
        "message": f"Lead {enquiry.full_name} status updated to {enquiry.get_status_display()}"
    }

@api.post("/owner/trips/{trip_id}/quick-update/", response=ApiResponse, tags=["Owner"])
def update_owner_trip_config(request, trip_id: int, payload: UpdateTripConfigIn):
    trip = get_object_or_404(Trip, id=trip_id)
    if payload.price is not None:
        trip.price = payload.price
    if payload.is_featured is not None:
        trip.is_featured = payload.is_featured
    if payload.is_bestseller is not None:
        trip.is_bestseller = payload.is_bestseller
    trip.save()

    return {
        "success": True,
        "data": {
            "id": trip.id,
            "price": float(trip.price),
            "is_featured": trip.is_featured,
            "is_bestseller": trip.is_bestseller
        },
        "message": f"Trip {trip.title} updated successfully"
    }

# ----------------- Owner: Cron Jobs Engine -----------------
@api.get("/owner/crons/", response=ApiResponse, tags=["Owner Cron Engine"])
def get_owner_crons(request):
    """List all scheduled background cron jobs with live state and logs"""
    jobs_list = list(CRON_JOB_REGISTRY.values())
    return {
        "success": True,
        "data": {
            "jobs": jobs_list,
            "total_jobs": len(jobs_list),
            "active_count": sum(1 for j in jobs_list if j.get("active")),
            "engine_status": "OPERATIONAL"
        },
        "message": "Cron job registry retrieved successfully"
    }

@api.post("/owner/crons/trigger/", response=ApiResponse, tags=["Owner Cron Engine"])
def trigger_owner_cron(request, payload: TriggerCronIn):
    """Manually trigger an automated background cron job on demand"""
    result = execute_cron_job(payload.job_id)
    if not result.get("success"):
        return {
            "success": False,
            "data": result,
            "message": result.get("error", "Cron execution failed")
        }
    return {
        "success": True,
        "data": result,
        "message": f"Cron job '{payload.job_id}' executed successfully"
    }

@api.post("/owner/crons/toggle/", response=ApiResponse, tags=["Owner Cron Engine"])
def toggle_owner_cron(request, payload: ToggleCronIn):
    """Enable or pause an automated cron job"""
    if payload.job_id not in CRON_JOB_REGISTRY:
        return {
            "success": False,
            "data": None,
            "message": f"Job {payload.job_id} not found"
        }
    CRON_JOB_REGISTRY[payload.job_id]["active"] = payload.active
    status_str = "activated" if payload.active else "paused"
    return {
        "success": True,
        "data": CRON_JOB_REGISTRY[payload.job_id],
        "message": f"Cron job '{payload.job_id}' is now {status_str}"
    }

# ----------------- Owner: Rate Limiting Stats -----------------
@api.get("/owner/ratelimit-stats/", response=ApiResponse, tags=["Owner Security"])
def get_ratelimit_stats(request):
    """Get active sliding-window rate limiting metrics and security status"""
    stats = limiter.get_stats()
    return {
        "success": True,
        "data": stats,
        "message": "Rate limiter metrics retrieved successfully"
    }


