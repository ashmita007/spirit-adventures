from ninja import Router
from django.db.models import Sum
from datetime import datetime, timezone
import calendar
from decimal import Decimal
from typing import Optional

from .models import MonthlyTarget
from .schemas import MonthlyTargetOut, MonthlyTargetIn
from crm.accounts.models import CustomUser
from crm.enquiries.models import Enquiry
from crm.accounts.auth import OptionalAuthBearer, ManagerBearer

router = Router(tags=["CRM Targets"], auth=OptionalAuthBearer())

@router.get("/monthly-target/", auth=OptionalAuthBearer(), response=MonthlyTargetOut)
def get_current_monthly_target(request, sales_person_id: Optional[int] = None, month: Optional[int] = None, year: Optional[int] = None):
    now = datetime.now()
    target_year = year or now.year
    target_month = month or now.month
    
    user = getattr(request, 'user', None)
    # If sales person, default or force to their own target
    if user and user.is_authenticated and not user.is_manager_or_admin:
        sales_person_id = user.id

    # Target object
    target_obj = MonthlyTarget.objects.filter(
        year=target_year,
        month=target_month,
        sales_person_id=sales_person_id
    ).first()
    
    target_amount = target_obj.target_amount if target_obj else Decimal('500000.00')
    
    # Calculate revenue collected
    enquiries_qs = Enquiry.objects.filter(
        created_at__year=target_year,
        created_at__month=target_month,
    )
    if sales_person_id:
        enquiries_qs = enquiries_qs.filter(sales_person_id=sales_person_id)
        
    actual_collected = enquiries_qs.aggregate(total=Sum('advance_paid'))['total'] or Decimal('0.00')
    remaining = max(Decimal('0.00'), target_amount - actual_collected)
    percentage = float((actual_collected / target_amount) * 100) if target_amount > 0 else 0.0
    
    # Calculate days remaining
    _, num_days = calendar.monthrange(target_year, target_month)
    current_day = now.day if (now.year == target_year and now.month == target_month) else 1
    days_remaining = max(0, num_days - current_day)
    
    sp_name = "Company Overall"
    if sales_person_id:
        sp = CustomUser.objects.filter(id=sales_person_id).first()
        if sp:
            sp_name = sp.display_name
            
    return {
        "year": target_year,
        "month": target_month,
        "month_name": calendar.month_name[target_month],
        "target_amount": target_amount,
        "actual_collected": actual_collected,
        "remaining": remaining,
        "percentage": round(percentage, 1),
        "days_remaining": days_remaining,
        "sales_person_id": sales_person_id,
        "sales_person_name": sp_name,
    }

@router.post("/monthly-target/", auth=ManagerBearer(), response={200: MonthlyTargetOut})
def set_monthly_target(request, payload: MonthlyTargetIn):
    obj, _ = MonthlyTarget.objects.update_or_create(
        year=payload.year,
        month=payload.month,
        sales_person_id=payload.sales_person_id,
        defaults={"target_amount": payload.target_amount, "notes": payload.notes}
    )
    return get_current_monthly_target(request, sales_person_id=payload.sales_person_id, month=payload.month, year=payload.year)
