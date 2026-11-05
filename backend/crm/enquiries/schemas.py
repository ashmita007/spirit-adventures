from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

class TourPackageOut(BaseModel):
    id: int
    name: str
    destination: str
    duration_days: int
    base_price: Decimal
    is_active: bool

    class Config:
        from_attributes = True

class CommentIn(BaseModel):
    comment_text: Optional[str] = None
    comment: Optional[str] = None
    call_status: Optional[str] = "general_note"

class CommentOut(BaseModel):
    id: int
    author_name: Optional[str] = "Team"
    call_status: str
    comment_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class EnquiryIn(BaseModel):
    name: str
    contact: str
    email: Optional[str] = None
    departure_city: Optional[str] = "Bangalore"
    tour_package_id: Optional[int] = None
    custom_tour_name: Optional[str] = None
    date_of_travel: date
    followup_date: Optional[date] = None
    pnr_up: Optional[str] = None
    pnr_down: Optional[str] = None
    accommodation_type: Optional[str] = "sharing"
    total_people: Optional[int] = 1
    boys_count: Optional[int] = 0
    girls_count: Optional[int] = 0
    couples_count: Optional[int] = 0
    total_amount: Optional[Decimal] = Decimal("0.00")
    advance_paid: Optional[Decimal] = Decimal("0.00")
    status: Optional[str] = "new"
    sales_person_id: Optional[int] = None
    notes: Optional[str] = None

class EnquiryUpdateIn(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    departure_city: Optional[str] = None
    tour_package_id: Optional[int] = None
    custom_tour_name: Optional[str] = None
    date_of_travel: Optional[date] = None
    followup_date: Optional[date] = None
    pnr_up: Optional[str] = None
    pnr_down: Optional[str] = None
    accommodation_type: Optional[str] = None
    total_people: Optional[int] = None
    boys_count: Optional[int] = None
    girls_count: Optional[int] = None
    couples_count: Optional[int] = None
    total_amount: Optional[Decimal] = None
    advance_paid: Optional[Decimal] = None
    status: Optional[str] = None
    sales_person_id: Optional[int] = None
    notes: Optional[str] = None

class EnquiryOut(BaseModel):
    id: int
    name: str
    contact: str
    email: Optional[str] = None
    departure_city: str
    tour_name: str
    tour_package_id: Optional[int] = None
    date_of_travel: date
    followup_date: Optional[date] = None
    pnr_up: Optional[str] = None
    pnr_down: Optional[str] = None
    accommodation_type: str
    total_people: int
    boys_count: int
    girls_count: int
    couples_count: int
    total_amount: Decimal
    advance_paid: Decimal
    balance_amount: Decimal
    payment_status: str
    status: str
    sales_person_id: Optional[int] = None
    sales_person_name: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[str] = "manual"
    created_at: datetime
    updated_at: datetime
    comments_count: Optional[int] = 0
    comments: Optional[List[CommentOut]] = []

    class Config:
        from_attributes = True

class DashboardStatsOut(BaseModel):
    total_enquiries: int
    new_leads: int
    confirmed_bookings: int
    total_revenue_booked: Decimal
    total_advance_collected: Decimal
    total_balance_pending: Decimal
    total_travelers: int
    total_boys: int
    total_girls: int
    total_couples: int
    conversion_rate: float
    accommodation_breakdown: dict

class CalendarDayDepartureOut(BaseModel):
    date: str
    total_departures: int
    total_travelers: int
    boys: int
    girls: int
    couples: int
    trips: List[dict]

class PaginatedEnquiriesOut(BaseModel):
    items: List[EnquiryOut]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool

