from ninja import Schema
from typing import List, Optional, Any
from datetime import datetime

class DestinationOut(Schema):
    id: int
    name: str
    slug: str
    subtitle: Optional[str] = ""
    description: str
    cover_image: str
    hero_image: Optional[str] = ""
    is_featured: bool
    trip_count: Optional[int] = 0

class CategoryOut(Schema):
    id: int
    name: str
    slug: str
    icon: str
    description: Optional[str] = ""

class TripImageOut(Schema):
    id: int
    image_url: str
    caption: Optional[str] = ""
    ordering: int
    is_cover: bool

class TripVideoOut(Schema):
    id: int
    video_url: str
    poster_image: Optional[str] = ""
    title: Optional[str] = ""

class TripItineraryOut(Schema):
    id: int
    day_number: int
    title: str
    description: str
    altitude: Optional[str] = ""
    distance: Optional[str] = ""
    meals: Optional[str] = ""
    stay_type: Optional[str] = ""

class FAQOut(Schema):
    id: int
    question: str
    answer: str
    category: str

class ReviewOut(Schema):
    id: int
    traveler_name: str
    traveler_location: Optional[str] = ""
    avatar_url: Optional[str] = ""
    rating: int
    review_text: str
    travel_date: Optional[str] = ""
    is_verified: bool
    is_featured: bool
    trip_title: Optional[str] = None

class TripListOut(Schema):
    id: int
    title: str
    slug: str
    destination_name: str
    destination_slug: str
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    short_description: str
    duration_days: int
    duration_nights: int
    duration_label: str
    difficulty: str
    price: float
    original_price: Optional[float] = None
    cover_image: str
    hero_video_url: Optional[str] = ""
    altitude: Optional[str] = ""
    trek_distance: Optional[str] = ""
    is_featured: bool
    is_bestseller: bool
    rating: float = 4.9
    reviews_count: int = 24

class TripDetailOut(Schema):
    id: int
    title: str
    slug: str
    destination: DestinationOut
    category: Optional[CategoryOut] = None
    short_description: str
    full_description: str
    duration_days: int
    duration_nights: int
    duration_label: str
    difficulty: str
    price: float
    original_price: Optional[float] = None
    pickup_location: str
    drop_location: str
    altitude: Optional[str] = ""
    trek_distance: Optional[str] = ""
    best_season: str
    cover_image: str
    hero_video_url: Optional[str] = ""
    inclusions: List[str] = []
    exclusions: List[str] = []
    things_to_carry: List[str] = []
    is_featured: bool
    is_bestseller: bool
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    gallery_images: List[TripImageOut] = []
    videos: List[TripVideoOut] = []
    itinerary_days: List[TripItineraryOut] = []
    faqs: List[FAQOut] = []
    reviews: List[ReviewOut] = []
    rating: float = 4.9
    reviews_count: int = 24

class EnquiryIn(Schema):
    trip_id: Optional[int] = None
    trip_slug: Optional[str] = None
    full_name: str
    email: str
    phone: str
    travel_date: Optional[str] = ""
    travelers_count: int = 1
    message: Optional[str] = ""

class EnquiryOut(Schema):
    id: int
    full_name: str
    email: str
    phone: str
    status: str
    created_at: datetime

class GalleryImageOut(Schema):
    id: int
    title: str
    category: str
    image_url: str
    caption: Optional[str] = ""
    location: Optional[str] = ""
    is_featured: bool

class BlogPostListOut(Schema):
    id: int
    title: str
    slug: str
    excerpt: str
    cover_image: str
    author: str
    category: str
    reading_time_minutes: int
    published_at: datetime

class BlogPostDetailOut(Schema):
    id: int
    title: str
    slug: str
    excerpt: str
    content: str
    cover_image: str
    author: str
    category: str
    reading_time_minutes: int
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    published_at: datetime

class ApiResponse(Schema):
    success: bool
    data: Optional[Any] = None
    message: str = "Success"
    errors: Optional[Any] = None

class TriggerCronIn(Schema):
    job_id: str

class ToggleCronIn(Schema):
    job_id: str
    active: bool
