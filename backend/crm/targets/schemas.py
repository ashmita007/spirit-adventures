from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class MonthlyTargetOut(BaseModel):
    year: int
    month: int
    month_name: str
    target_amount: Decimal
    actual_collected: Decimal
    remaining: Decimal
    percentage: float
    days_remaining: int
    sales_person_id: Optional[int] = None
    sales_person_name: Optional[str] = "Company Overall"

class MonthlyTargetIn(BaseModel):
    year: int
    month: int
    target_amount: Decimal
    sales_person_id: Optional[int] = None
    notes: Optional[str] = None
