from django.db import models
from django.conf import settings
from decimal import Decimal

class TourPackage(models.Model):
    name = models.CharField(max_length=150, unique=True)
    destination = models.CharField(max_length=100)
    duration_days = models.IntegerField(default=5)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=15000.00)
    is_active = models.BooleanField(default=True)
    # Slug of the matching trip on the public website, set by the website sync
    website_slug = models.SlugField(max_length=220, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.destination})"

class Enquiry(models.Model):
    STATUS_CHOICES = (
        ('new', 'New Lead'),
        ('contacted', 'Contacted / Follow Up'),
        ('booked', 'Booking Confirmed'),
        ('travelled', 'Travelled / Completed'),
        ('cancelled', 'Cancelled'),
        ('lost', 'Lost / Dropped'),
    )

    ACCOMMODATION_CHOICES = (
        ('sharing', 'Sharing Room'),
        ('private_room', 'Private Room'),
        ('tent', 'Tent / Camping'),
    )

    SOURCE_CHOICES = (
        ('manual', 'Added in CRM'),
        ('website', 'Website Enquiry'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('advance_paid', 'Advance Paid'),
        ('fully_paid', 'Fully Paid'),
    )

    # Lead Traveler Details
    name = models.CharField(max_length=120)
    contact = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    departure_city = models.CharField(max_length=80, default="Bangalore")

    # Tour Details
    tour_package = models.ForeignKey(TourPackage, on_delete=models.SET_NULL, null=True, blank=True, related_name='enquiries')
    custom_tour_name = models.CharField(max_length=150, blank=True, null=True)
    date_of_travel = models.DateField(help_text="Departure / Travel Date")
    followup_date = models.DateField(blank=True, null=True)

    # Logistics / Transport
    pnr_up = models.CharField(max_length=50, blank=True, null=True, help_text="PNR Upward Journey")
    pnr_down = models.CharField(max_length=50, blank=True, null=True, help_text="PNR Return Journey")

    # Accommodation
    accommodation_type = models.CharField(
        max_length=25,
        choices=ACCOMMODATION_CHOICES,
        default='sharing'
    )

    # Group Segregation
    total_people = models.PositiveIntegerField(default=1)
    boys_count = models.PositiveIntegerField(default=0)
    girls_count = models.PositiveIntegerField(default=0)
    couples_count = models.PositiveIntegerField(default=0)

    # Financials
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    advance_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')

    # Workflow & Assignment
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='new')
    sales_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_enquiries'
    )

    notes = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')
    # Website enquiry id ("web-<id>"); makes repeated website pushes idempotent
    external_ref = models.CharField(max_length=64, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'CRM lead'
        verbose_name_plural = 'CRM leads'

    def __str__(self):
        dest = self.tour_package.name if self.tour_package else (self.custom_tour_name or "Tour")
        return f"{self.name} - {dest} ({self.date_of_travel})"

    def save(self, *args, **kwargs):
        # Auto-compute balance amount
        if self.total_amount is not None and self.advance_paid is not None:
            self.balance_amount = max(Decimal('0.00'), self.total_amount - self.advance_paid)
            if self.total_amount > 0 and self.advance_paid >= self.total_amount:
                self.payment_status = 'fully_paid'
            elif self.advance_paid > 0:
                self.payment_status = 'advance_paid'
            else:
                self.payment_status = 'unpaid'
        super().save(*args, **kwargs)

class EnquiryComment(models.Model):
    CALL_STATUS_CHOICES = (
        ('connected', 'Call Connected'),
        ('busy', 'Call Busy / Waiting'),
        ('unreachable', 'Unreachable / Switched Off'),
        ('callback_requested', 'Call Back Requested'),
        ('interested', 'High Interest / Booking Likely'),
        ('not_interested', 'Not Interested'),
        ('advance_collected', 'Advance Collected'),
        ('general_note', 'General Note'),
    )

    enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enquiry_comments'
    )
    call_status = models.CharField(max_length=30, choices=CALL_STATUS_CHOICES, default='general_note')
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lead comment'

    def __str__(self):
        return f"Comment on {self.enquiry.name} by {self.author} at {self.created_at}"
