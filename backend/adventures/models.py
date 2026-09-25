from django.db import models
from django.utils.text import slugify

class Destination(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    cover_image = models.CharField(max_length=500, help_text="Image URL or public path")
    hero_image = models.CharField(max_length=500, blank=True, help_text="Large banner image URL")
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    ordering = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordering', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon = models.CharField(max_length=50, default="Mountain", help_text="Icon identifier e.g. Mountain, Tent, Waves, Snowflake, Sun, Users")
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    ordering = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['ordering', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Trip(models.Model):
    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MODERATE', 'Moderate'),
        ('CHALLENGING', 'Challenging'),
        ('DIFFICULT', 'Difficult'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='trips')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='trips')
    
    short_description = models.CharField(max_length=300)
    full_description = models.TextField()
    
    duration_days = models.PositiveIntegerField(default=1)
    duration_nights = models.PositiveIntegerField(default=0)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='MODERATE')
    
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Current starting price in INR")
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Original price for discount strikethrough")
    
    pickup_location = models.CharField(max_length=150, default="Dehradun / Base Camp")
    drop_location = models.CharField(max_length=150, default="Dehradun / Base Camp")
    altitude = models.CharField(max_length=100, blank=True, help_text="e.g. 12,500 ft / 3,810 m")
    trek_distance = models.CharField(max_length=100, blank=True, help_text="e.g. 20 km total")
    best_season = models.CharField(max_length=150, default="Dec - Apr")
    
    cover_image = models.CharField(max_length=500, help_text="Main landscape photo URL")
    hero_video_url = models.CharField(max_length=500, blank=True, help_text="Optional nature video link (.mp4 or embed)")
    
    inclusions = models.JSONField(default=list, blank=True, help_text="List of strings e.g. ['All meals on trek', 'Tented accommodation']")
    exclusions = models.JSONField(default=list, blank=True, help_text="List of strings e.g. ['Transport to base camp', 'Personal porter']")
    things_to_carry = models.JSONField(default=list, blank=True, help_text="List of items e.g. ['Trekking shoes', 'Warm jacket', 'Rain poncho']")
    
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    
    meta_title = models.CharField(max_length=150, blank=True)
    meta_description = models.CharField(max_length=250, blank=True)
    
    ordering = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordering', '-is_featured', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def duration_label(self):
        if self.duration_nights > 0:
            return f"{self.duration_days}D / {self.duration_nights}N"
        return f"{self.duration_days} Days"


class TripImage(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='gallery_images')
    image_url = models.CharField(max_length=500)
    caption = models.CharField(max_length=200, blank=True)
    ordering = models.PositiveIntegerField(default=0)
    is_cover = models.BooleanField(default=False)

    class Meta:
        ordering = ['ordering', 'id']

    def __str__(self):
        return f"{self.trip.title} - Image #{self.id}"


class TripVideo(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='videos')
    video_url = models.CharField(max_length=500)
    poster_image = models.CharField(max_length=500, blank=True)
    title = models.CharField(max_length=150, blank=True)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['ordering']

    def __str__(self):
        return f"{self.trip.title} - Video: {self.title or 'Nature Loop'}"


class TripItinerary(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='itinerary_days')
    day_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=200)
    description = models.TextField()
    altitude = models.CharField(max_length=100, blank=True)
    distance = models.CharField(max_length=100, blank=True)
    meals = models.CharField(max_length=150, default="Breakfast, Lunch, Dinner")
    stay_type = models.CharField(max_length=150, default="Tented Camp / Alpine Tents")
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['day_number', 'ordering']
        verbose_name_plural = "Trip Itineraries"

    def __str__(self):
        return f"{self.trip.title} - Day {self.day_number}: {self.title}"


class Enquiry(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New Enquiry'),
        ('CONTACTED', 'Contacted'),
        ('FOLLOW_UP', 'Follow Up'),
        ('PAYMENT_PENDING', 'Payment Pending'),
        ('CONVERTED', 'Converted'),
        ('CLOSED', 'Closed'),
    ]

    PRIORITY_CHOICES = [
        ('HIGH', 'High Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('LOW', 'Low Priority'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='enquiries')
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=25)
    travel_date = models.CharField(max_length=50, blank=True, help_text="Preferred travel date or month")
    travelers_count = models.PositiveIntegerField(default=1)
    message = models.TextField(blank=True)
    departure_city = models.CharField(max_length=100, blank=True, default="Bengaluru")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    follow_up_date = models.CharField(max_length=100, blank=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Enquiries"
        ordering = ['-created_at']

    def __str__(self):
        trip_name = self.trip.title if self.trip else "General Enquiry"
        return f"{self.full_name} ({self.phone}) - {trip_name}"


class Review(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    traveler_name = models.CharField(max_length=150)
    traveler_location = models.CharField(max_length=150, blank=True, default="Bangalore, India")
    avatar_url = models.CharField(max_length=500, blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    review_text = models.TextField()
    travel_date = models.CharField(max_length=50, blank=True, default="October 2024")
    
    is_verified = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"{self.traveler_name} ({self.rating}★) - {self.trip.title if self.trip else 'General'}"


class GalleryImage(models.Model):
    title = models.CharField(max_length=150)
    category = models.CharField(max_length=100, default="Mountains", help_text="e.g. Mountains, Lakes, Camping, Treks, Sunrises")
    image_url = models.CharField(max_length=500)
    caption = models.CharField(max_length=250, blank=True)
    location = models.CharField(max_length=150, blank=True)
    ordering = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['ordering', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.location})"


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    excerpt = models.TextField()
    content = models.TextField()
    cover_image = models.CharField(max_length=500)
    author = models.CharField(max_length=100, default="Spirit Adventure Team")
    category = models.CharField(max_length=100, default="Trekking Guides")
    reading_time_minutes = models.PositiveIntegerField(default=5)
    
    meta_title = models.CharField(max_length=150, blank=True)
    meta_description = models.CharField(max_length=250, blank=True)
    
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class FAQ(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, null=True, blank=True, related_name='faqs')
    question = models.CharField(max_length=250)
    answer = models.TextField()
    category = models.CharField(max_length=100, default="General", help_text="e.g. Booking, Safety, Gear, Fitness")
    ordering = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['ordering', 'id']
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question
