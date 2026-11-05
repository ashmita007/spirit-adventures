from ninja import Router
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from typing import Optional, List
from datetime import date, datetime, timedelta
from decimal import Decimal
import math

from .models import Enquiry, TourPackage, EnquiryComment
from .schemas import (
    TourPackageOut, EnquiryIn, EnquiryUpdateIn, EnquiryOut,
    CommentIn, CommentOut, DashboardStatsOut, CalendarDayDepartureOut,
    PaginatedEnquiriesOut
)
from crm.accounts.models import CustomUser
from crm.accounts.auth import OptionalAuthBearer, ManagerBearer, AuthBearer, scope_to_user

# Every CRM endpoint needs a signed-in, approved team member (see crm.accounts.auth)
router = Router(tags=["CRM Enquiries"], auth=AuthBearer())


def _get_visible_enquiry(request, id: int):
    """Fetch an enquiry the current user may see, else None (reps only see their own)."""
    enquiry = Enquiry.objects.select_related('tour_package', 'sales_person').filter(id=id).first()
    if enquiry is None:
        return None
    if not request.user.can_view_enquiry(enquiry):
        return None
    return enquiry

def serialize_enquiry(e: Enquiry, include_comments: bool = True) -> dict:
    tour_name = e.tour_package.name if e.tour_package else (e.custom_tour_name or "Custom Expedition")
    sp_name = e.sales_person.display_name if e.sales_person else "Unassigned"
    
    comments_list = []
    if include_comments:
        for c in e.comments.all().select_related('author').order_by('-created_at'):
            author_str = c.author.display_name if c.author else "Team Member"
            comments_list.append({
                "id": c.id,
                "author_name": author_str,
                "call_status": c.call_status,
                "comment_text": c.comment_text,
                "created_at": c.created_at,
            })
            
    return {
        "id": e.id,
        "name": e.name,
        "contact": e.contact,
        "email": e.email,
        "departure_city": e.departure_city,
        "tour_name": tour_name,
        "tour_package_id": e.tour_package_id,
        "date_of_travel": e.date_of_travel,
        "followup_date": e.followup_date,
        "pnr_up": e.pnr_up,
        "pnr_down": e.pnr_down,
        "accommodation_type": e.accommodation_type or "sharing",
        "total_people": e.total_people or 1,
        "boys_count": e.boys_count or 0,
        "girls_count": e.girls_count or 0,
        "couples_count": e.couples_count or 0,
        "total_amount": e.total_amount or Decimal('0.00'),
        "advance_paid": e.advance_paid or Decimal('0.00'),
        "balance_amount": e.balance_amount or Decimal('0.00'),
        "payment_status": e.payment_status or "unpaid",
        "status": e.status,
        "sales_person_id": e.sales_person_id,
        "sales_person_name": sp_name,
        "notes": e.notes,
        "source": getattr(e, "source", "manual") or "manual",
        "created_at": e.created_at,
        "updated_at": e.updated_at,
        "comments_count": e.comments.count(),
        "comments": comments_list,
    }

# 1. Packages
@router.get("/packages/", response=List[TourPackageOut])
def list_packages(request):
    return list(TourPackage.objects.filter(is_active=True).order_by('name'))

# 2. Enquiries List (Both /enquiries/ and Couspro /enquiry-list/)
@router.get("/enquiries/", auth=OptionalAuthBearer(), response=List[EnquiryOut])
@router.get("/enquiry-list/", auth=OptionalAuthBearer(), response=List[EnquiryOut])
def list_enquiries(
    request,
    status: Optional[str] = None,
    sales_person_id: Optional[int] = None,
    search: Optional[str] = None,
    accommodation_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    qs = Enquiry.objects.select_related('tour_package', 'sales_person').prefetch_related('comments__author').all()
    
    user = getattr(request, 'user', None)
    if user and user.is_authenticated and not user.is_manager_or_admin:
        qs = qs.filter(sales_person=user)
    elif sales_person_id:
        qs = qs.filter(sales_person_id=sales_person_id)

    if status and status != "all":
        qs = qs.filter(status=status)
    if accommodation_type and accommodation_type != "all":
        qs = qs.filter(accommodation_type=accommodation_type)
    if start_date:
        qs = qs.filter(date_of_travel__gte=start_date)
    if end_date:
        qs = qs.filter(date_of_travel__lte=end_date)
    if search:
        qs = qs.filter(
            Q(name__icontains=search) |
            Q(contact__icontains=search) |
            Q(email__icontains=search) |
            Q(pnr_up__icontains=search) |
            Q(pnr_down__icontains=search) |
            Q(custom_tour_name__icontains=search) |
            Q(tour_package__name__icontains=search)
        )
        
    return [serialize_enquiry(e) for e in qs]

# 2b. Enquiries Server-Side Paginated (Couspro DataTables equivalent)
@router.get("/enquiries/paginated/", auth=OptionalAuthBearer(), response=PaginatedEnquiriesOut)
@router.get("/enquiry-list/paginated/", auth=OptionalAuthBearer(), response=PaginatedEnquiriesOut)
def list_enquiries_paginated(
    request,
    page: int = 1,
    per_page: int = 10,
    status: Optional[str] = None,
    sales_person_id: Optional[int] = None,
    search: Optional[str] = None,
    accommodation_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    qs = Enquiry.objects.select_related('tour_package', 'sales_person').prefetch_related('comments__author').all()
    
    user = getattr(request, 'user', None)
    if user and user.is_authenticated and not user.is_manager_or_admin:
        qs = qs.filter(sales_person=user)
    elif sales_person_id:
        qs = qs.filter(sales_person_id=sales_person_id)

    if status and status != "all":
        qs = qs.filter(status=status)
    if accommodation_type and accommodation_type != "all":
        qs = qs.filter(accommodation_type=accommodation_type)
    if start_date:
        qs = qs.filter(date_of_travel__gte=start_date)
    if end_date:
        qs = qs.filter(date_of_travel__lte=end_date)
    if search:
        qs = qs.filter(
            Q(name__icontains=search) |
            Q(contact__icontains=search) |
            Q(email__icontains=search) |
            Q(pnr_up__icontains=search) |
            Q(pnr_down__icontains=search) |
            Q(custom_tour_name__icontains=search) |
            Q(tour_package__name__icontains=search)
        )
        
    total = qs.count()
    per_page = max(1, per_page)
    total_pages = max(1, math.ceil(total / per_page)) if total > 0 else 1
    page = max(1, min(page, total_pages)) if total > 0 else 1
    
    offset = (page - 1) * per_page
    page_qs = qs.order_by('-created_at')[offset:offset + per_page]
    
    return {
        "items": [serialize_enquiry(e) for e in page_qs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }

# 3. Today's Enquiries (Couspro equivalent)
@router.get("/today-enquiries/", response=List[EnquiryOut])
def get_today_enquiries(request):
    today = date.today()
    qs = Enquiry.objects.filter(created_at__date=today).select_related('tour_package', 'sales_person')
    qs = scope_to_user(qs, request)
    return [serialize_enquiry(e) for e in qs]

# 4. Today's Follow-ups (Couspro equivalent)
@router.get("/today-followups/", response=List[EnquiryOut])
def get_today_followups(request, sales_person_id: Optional[int] = None):
    today = date.today()
    qs = Enquiry.objects.filter(followup_date__lte=today).exclude(status__in=['travelled', 'cancelled']).select_related('tour_package', 'sales_person')
    if sales_person_id:
        qs = qs.filter(sales_person_id=sales_person_id)
    qs = scope_to_user(qs, request)
    return [serialize_enquiry(e, include_comments=True) for e in qs]

# 5. Pending Enquiries (Couspro equivalent)
@router.get("/pending-enquiries/", response=List[EnquiryOut])
def get_pending_enquiries(request):
    qs = Enquiry.objects.filter(status__in=['new', 'contacted']).select_related('tour_package', 'sales_person')
    qs = scope_to_user(qs, request)
    return [serialize_enquiry(e) for e in qs]

# 6. Payment Due Lists (Couspro /payment-due/today/ and /payment-due/past/)
@router.get("/payment-due/today/", response=List[EnquiryOut])
def get_today_payment_due(request):
    today = date.today()
    qs = Enquiry.objects.filter(
        balance_amount__gt=0,
        date_of_travel=today
    ).select_related('tour_package', 'sales_person')
    qs = scope_to_user(qs, request)
    return [serialize_enquiry(e) for e in qs]

@router.get("/payment-due/past/", response=List[EnquiryOut])
def get_past_payment_due(request):
    today = date.today()
    qs = Enquiry.objects.filter(
        balance_amount__gt=0,
        date_of_travel__lt=today
    ).select_related('tour_package', 'sales_person')
    qs = scope_to_user(qs, request)
    return [serialize_enquiry(e) for e in qs]

@router.get("/payment-due/all/", response=List[EnquiryOut])
def get_all_payment_due(request):
    qs = Enquiry.objects.filter(balance_amount__gt=0).select_related('tour_package', 'sales_person')
    qs = scope_to_user(qs, request)
    return [serialize_enquiry(e) for e in qs]

# 7. Check Mobile Exists (Couspro equivalent)
@router.get("/check-mobile-exists/")
def check_mobile_exists(request, mobile: str):
    exists = Enquiry.objects.filter(contact__icontains=mobile.strip()).exists()
    return {"exists": exists, "mobile": mobile}

# 8. Create Enquiry (Couspro /add-enquiry/ & /enquiries/)
@router.post("/enquiries/", response={201: EnquiryOut, 400: dict})
@router.post("/add-enquiry/", response={201: EnquiryOut, 400: dict})
def create_enquiry(request, payload: EnquiryIn):
    data = payload.dict(exclude_unset=True)
    sales_person_id = data.pop("sales_person_id", None)
    tour_package_id = data.pop("tour_package_id", None)
    
    enquiry = Enquiry(**data)

    if not request.user.is_manager_or_admin:
        sales_person_id = request.user.id

    if sales_person_id:
        try:
            enquiry.sales_person = CustomUser.objects.get(id=sales_person_id)
        except CustomUser.DoesNotExist:
            pass
            
    if tour_package_id:
        try:
            enquiry.tour_package = TourPackage.objects.get(id=tour_package_id)
            if not enquiry.total_amount or enquiry.total_amount == 0:
                enquiry.total_amount = enquiry.tour_package.base_price * enquiry.total_people
        except TourPackage.DoesNotExist:
            pass
            
    enquiry.save()
    
    if enquiry.notes:
        EnquiryComment.objects.create(
            enquiry=enquiry,
            author=enquiry.sales_person,
            call_status='general_note',
            comment_text=f"Initial Note: {enquiry.notes}"
        )
        
    return 201, serialize_enquiry(enquiry, include_comments=True)

# 9. Single Enquiry Details
@router.get("/enquiries/{id}", response={200: EnquiryOut, 404: dict})
@router.get("/enquiry/{id}/", response={200: EnquiryOut, 404: dict})
def get_enquiry(request, id: int):
    enquiry = _get_visible_enquiry(request, id)
    if enquiry is None:
        return 404, {"message": "Enquiry not found"}
    return 200, serialize_enquiry(enquiry, include_comments=True)

# 10. Update Enquiry
@router.put("/enquiries/{id}", auth=OptionalAuthBearer(), response={200: EnquiryOut, 403: dict, 404: dict})
@router.patch("/enquiries/{id}", auth=OptionalAuthBearer(), response={200: EnquiryOut, 403: dict, 404: dict})
def update_enquiry(request, id: int, payload: EnquiryUpdateIn):
    try:
        enquiry = Enquiry.objects.get(id=id)
    except Enquiry.DoesNotExist:
        return 404, {"message": "Enquiry not found"}
        
    user = getattr(request, 'user', None)
    update_data = payload.dict(exclude_unset=True)

    if user and user.is_authenticated and not user.is_manager_or_admin:
        if enquiry.sales_person_id and enquiry.sales_person_id != user.id:
            return 403, {"message": "Permission denied: You can only edit enquiries assigned to you."}
        if "sales_person_id" in update_data and update_data["sales_person_id"] != user.id:
            return 403, {"message": "Permission denied: Sales representatives cannot reassign leads to others."}
    
    if "sales_person_id" in update_data:
        sp_id = update_data.pop("sales_person_id")
        enquiry.sales_person = CustomUser.objects.filter(id=sp_id).first() if sp_id else None
        
    if "tour_package_id" in update_data:
        pkg_id = update_data.pop("tour_package_id")
        enquiry.tour_package = TourPackage.objects.filter(id=pkg_id).first() if pkg_id else None
        
    for key, value in update_data.items():
        if value is not None:
            setattr(enquiry, key, value)
            
    enquiry.save()
    return 200, serialize_enquiry(enquiry, include_comments=True)

# 11. Quick Status Update (Couspro /update-status/)
@router.post("/update-status/", auth=OptionalAuthBearer())
def update_status(request, enquiry_id: int, status: str, status_note: Optional[str] = None):
    try:
        enquiry = Enquiry.objects.get(id=enquiry_id)
        user = getattr(request, 'user', None)
        if user and user.is_authenticated and not user.is_manager_or_admin:
            if enquiry.sales_person_id and enquiry.sales_person_id != user.id:
                return {"status": "error", "message": "Permission denied: You can only update your assigned enquiries."}

        enquiry.status = status
        enquiry.save()
        if status_note and status_note.strip():
            author_user = user if (user and user.is_authenticated) else enquiry.sales_person
            EnquiryComment.objects.create(
                enquiry=enquiry,
                author=author_user,
                call_status='general_note',
                comment_text=f"Status updated to {status}: {status_note.strip()}"
            )
        return {"status": "success", "enquiry_id": enquiry_id, "new_status": status}
    except Enquiry.DoesNotExist:
        return {"status": "error", "message": "Enquiry not found"}

# 11b. Quick Follow-up Date Update (Couspro /update_followup_date/)
@router.post("/update-followup-date/")
def update_followup_date(request, enquiry_id: int, followup_date: date):
    try:
        enquiry = Enquiry.objects.get(id=enquiry_id)
        if not request.user.can_edit_enquiry(enquiry):
            return {"status": "error", "message": "Permission denied: this enquiry is assigned to someone else."}
        enquiry.followup_date = followup_date
        enquiry.save()
        return {
            "status": "success",
            "enquiry_id": enquiry_id,
            "followup_date": enquiry.followup_date.isoformat()
        }
    except Enquiry.DoesNotExist:
        return {"status": "error", "message": "Enquiry not found"}


# 12. Quick Payment Update (Couspro /enquiry/update-payment/)
@router.post("/update-payment/")
def update_payment(request, enquiry_id: int, advance_paid: Decimal):
    try:
        enquiry = Enquiry.objects.get(id=enquiry_id)
        if not request.user.can_edit_enquiry(enquiry):
            return {"status": "error", "message": "Permission denied: this enquiry is assigned to someone else."}
        enquiry.advance_paid = advance_paid
        enquiry.save()
        return {
            "status": "success",
            "enquiry_id": enquiry_id,
            "advance_paid": enquiry.advance_paid,
            "balance_amount": enquiry.balance_amount,
            "payment_status": enquiry.payment_status
        }
    except Enquiry.DoesNotExist:
        return {"status": "error", "message": "Enquiry not found"}

# 13. Delete Enquiry (Protected: Manager or Admin only)
@router.delete("/enquiries/{id}", auth=OptionalAuthBearer(), response={200: dict, 403: dict, 404: dict})
def delete_enquiry(request, id: int):
    user = getattr(request, 'user', None)
    if user and user.is_authenticated and not user.is_manager_or_admin:
        return 403, {"message": "Permission denied: Only managers and administrators can delete enquiries."}
    try:
        enquiry = Enquiry.objects.get(id=id)
        enquiry.delete()
        return 200, {"message": f"Enquiry #{id} deleted successfully"}
    except Enquiry.DoesNotExist:
        return 404, {"message": "Enquiry not found"}

# 14. Comments (Couspro /add_comment/ & /get-comments/)
@router.get("/get-comments/", response=List[CommentOut])
def get_comments_couspro(request, enquiry_id: Optional[int] = None):
    if not enquiry_id or _get_visible_enquiry(request, enquiry_id) is None:
        return []
    comments = EnquiryComment.objects.filter(enquiry_id=enquiry_id).select_related('author').order_by('-created_at')
    result = []
    for c in comments:
        author_str = c.author.display_name if c.author else "Team Member"
        result.append({
            "id": c.id,
            "author_name": author_str,
            "call_status": c.call_status,
            "comment_text": c.comment_text,
            "created_at": c.created_at,
        })
    return result

@router.get("/enquiries/{id}/comments", response=List[CommentOut])
def get_enquiry_comments(request, id: int):
    if _get_visible_enquiry(request, id) is None:
        return []
    comments = EnquiryComment.objects.filter(enquiry_id=id).select_related('author').order_by('-created_at')
    result = []
    for c in comments:
        author_str = c.author.display_name if c.author else "Team Member"
        result.append({
            "id": c.id,
            "author_name": author_str,
            "call_status": c.call_status,
            "comment_text": c.comment_text,
            "created_at": c.created_at,
        })
    return result

@router.post("/enquiries/{id}/comments", response={201: CommentOut, 404: dict, 400: dict})
def add_enquiry_comment_path(request, id: int, payload: CommentIn):
    enquiry = _get_visible_enquiry(request, id)
    if enquiry is None:
        return 404, {"message": "Enquiry not found"}
        
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        user = enquiry.sales_person
        
    text = payload.comment_text or payload.comment or ""
    if not text.strip():
        return 400, {"message": "Comment text cannot be empty"}
        
    comment = EnquiryComment.objects.create(
        enquiry=enquiry,
        author=user,
        call_status=payload.call_status or 'general_note',
        comment_text=text.strip()
    )
    
    author_str = comment.author.display_name if comment.author else "Team Member"
    return 201, {
        "id": comment.id,
        "author_name": author_str,
        "call_status": comment.call_status,
        "comment_text": comment.comment_text,
        "created_at": comment.created_at,
    }

@router.post("/add_comment/", response={201: CommentOut, 404: dict, 400: dict})
@router.post("/add-comment/", response={201: CommentOut, 404: dict, 400: dict})
def add_comment_couspro(
    request,
    enquiry_id: Optional[int] = None,
    comment: Optional[str] = None,
    call_status: Optional[str] = None,
    payload: Optional[CommentIn] = None
):
    eid = enquiry_id
    text = comment
    c_status = call_status or 'general_note'
    
    if payload:
        if payload.comment_text:
            text = payload.comment_text
        elif payload.comment:
            text = payload.comment
        if payload.call_status:
            c_status = payload.call_status
            
    if not eid and request.GET.get('enquiry_id'):
        try:
            eid = int(request.GET.get('enquiry_id'))
        except (ValueError, TypeError):
            pass

    if not eid:
        return 400, {"message": "enquiry_id is required"}
    if not text or not text.strip():
        return 400, {"message": "comment text is required"}

    enquiry = _get_visible_enquiry(request, eid)
    if enquiry is None:
        return 404, {"message": "Enquiry not found"}

    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        user = enquiry.sales_person

    new_comment = EnquiryComment.objects.create(
        enquiry=enquiry,
        author=user,
        call_status=c_status,
        comment_text=text.strip()
    )

    author_str = new_comment.author.display_name if new_comment.author else "Team Member"
    return 201, {
        "id": new_comment.id,
        "author_name": author_str,
        "call_status": new_comment.call_status,
        "comment_text": new_comment.comment_text,
        "created_at": new_comment.created_at,
    }

# 15. Dashboard Stats
@router.get("/dashboard/stats", auth=OptionalAuthBearer(), response=DashboardStatsOut)
def get_dashboard_stats(request, sales_person_id: Optional[int] = None):
    qs = Enquiry.objects.all()
    user = getattr(request, 'user', None)
    if user and user.is_authenticated and not user.is_manager_or_admin:
        qs = qs.filter(sales_person=user)
    elif sales_person_id:
        qs = qs.filter(sales_person_id=sales_person_id)
        
    total_enquiries = qs.count()
    new_leads = qs.filter(status='new').count()
    confirmed_bookings = qs.filter(status__in=['booked', 'travelled']).count()
    
    aggs = qs.aggregate(
        total_rev=Sum('total_amount'),
        total_adv=Sum('advance_paid'),
        total_bal=Sum('balance_amount'),
        total_ppl=Sum('total_people'),
        total_b=Sum('boys_count'),
        total_g=Sum('girls_count'),
        total_c=Sum('couples_count')
    )
    
    acc_counts = {
        "sharing": qs.filter(accommodation_type='sharing').count(),
        "private_room": qs.filter(accommodation_type='private_room').count(),
        "tent": qs.filter(accommodation_type='tent').count(),
    }
    
    conversion_rate = (confirmed_bookings / total_enquiries * 100) if total_enquiries > 0 else 0.0
    
    return {
        "total_enquiries": total_enquiries,
        "new_leads": new_leads,
        "confirmed_bookings": confirmed_bookings,
        "total_revenue_booked": aggs['total_rev'] or Decimal('0.00'),
        "total_advance_collected": aggs['total_adv'] or Decimal('0.00'),
        "total_balance_pending": aggs['total_bal'] or Decimal('0.00'),
        "total_travelers": aggs['total_ppl'] or 0,
        "total_boys": aggs['total_b'] or 0,
        "total_girls": aggs['total_g'] or 0,
        "total_couples": aggs['total_c'] or 0,
        "conversion_rate": round(conversion_rate, 1),
        "accommodation_breakdown": acc_counts,
    }

# 16. Monthly Summary Dashboard (Couspro /monthly-summary/)
@router.get("/monthly-summary/")
def get_monthly_summary(request, year: Optional[int] = None, month: Optional[int] = None):
    now = datetime.now()
    y = year or now.year
    m = month or now.month
    
    qs = scope_to_user(Enquiry.objects.filter(date_of_travel__year=y, date_of_travel__month=m), request)
    total_leads = qs.count()
    booked = qs.filter(status__in=['booked', 'travelled']).count()
    revenue = qs.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
    collected = qs.aggregate(Sum('advance_paid'))['advance_paid__sum'] or Decimal('0.00')
    pending = qs.aggregate(Sum('balance_amount'))['balance_amount__sum'] or Decimal('0.00')
    
    return {
        "year": y,
        "month": m,
        "total_leads": total_leads,
        "confirmed_bookings": booked,
        "total_revenue": revenue,
        "advance_collected": collected,
        "balance_pending": pending,
    }

# 17. Monthly Summary by Salesperson / Counsellor (Couspro /monthly-summary/counsellor/)
@router.get("/monthly-summary/salesperson/")
@router.get("/monthly-summary/counsellor/")
def get_monthly_summary_by_salesperson(request, year: Optional[int] = None, month: Optional[int] = None):
    now = datetime.now()
    y = year or now.year
    m = month or now.month
    
    salespersons = CustomUser.objects.filter(is_active=True).order_by('first_name')
    result = []
    
    for sp in salespersons:
        qs = Enquiry.objects.filter(sales_person=sp, date_of_travel__year=y, date_of_travel__month=m)
        total_leads = qs.count()
        booked = qs.filter(status__in=['booked', 'travelled']).count()
        collected = qs.aggregate(Sum('advance_paid'))['advance_paid__sum'] or Decimal('0.00')
        target = sp.target_amount or Decimal('200000.00')
        pct = float((collected / target) * 100) if target > 0 else 0.0
        
        result.append({
            "salesperson_id": sp.id,
            "name": sp.display_name,
            "role": sp.role,
            "total_leads": total_leads,
            "confirmed_bookings": booked,
            "advance_collected": collected,
            "target": target,
            "achievement_percentage": round(pct, 1),
        })
        
    return result

# 18. Calendar Departures (Couspro /calendar-data/ & /get-calendar-data/)
@router.get("/calendar/departures", response=List[CalendarDayDepartureOut])
@router.get("/calendar-data/", response=List[CalendarDayDepartureOut])
def get_calendar_departures(request, month: Optional[int] = None, year: Optional[int] = None):
    qs = scope_to_user(Enquiry.objects.filter(status__in=['booked', 'contacted', 'travelled', 'new']), request)
    if month and year:
        qs = qs.filter(date_of_travel__year=year, date_of_travel__month=month)
        
    departures_map = {}
    for e in qs.select_related('tour_package'):
        d_str = e.date_of_travel.strftime("%Y-%m-%d")
        if d_str not in departures_map:
            departures_map[d_str] = {
                "date": d_str,
                "total_departures": 0,
                "total_travelers": 0,
                "boys": 0,
                "girls": 0,
                "couples": 0,
                "trips": []
            }
        group = departures_map[d_str]
        group["total_departures"] += 1
        group["total_travelers"] += e.total_people or 1
        group["boys"] += e.boys_count or 0
        group["girls"] += e.girls_count or 0
        group["couples"] += e.couples_count or 0
        group["trips"].append({
            "enquiry_id": e.id,
            "lead_name": e.name,
            "tour": e.tour_package.name if e.tour_package else (e.custom_tour_name or "Custom Expedition"),
            "departure_city": e.departure_city,
            "pnr_up": e.pnr_up or "",
            "accommodation": e.accommodation_type or "sharing",
            "total_people": e.total_people or 1,
            "boys": e.boys_count or 0,
            "girls": e.girls_count or 0,
            "couples": e.couples_count or 0,
            "status": e.status,
            "payment_status": e.payment_status or "unpaid"
        })
        
    return sorted(departures_map.values(), key=lambda x: x["date"])
