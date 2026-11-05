from pydantic import BaseModel, EmailStr
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: Optional[str] = ""
    phone: Optional[str] = ""
    role: Optional[str] = "sales_person"
    target_amount: Optional[Decimal] = Decimal("200000.00")

class UserUpdateSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_approved: Optional[bool] = None
    is_active: Optional[bool] = None
    target_amount: Optional[Decimal] = None

class UserOutSchema(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str
    display_name: str
    target_amount: Decimal
    is_approved: bool = True
    is_active: bool = True
    is_superuser: bool = False
    is_manager_or_admin: bool = False
    permissions: List[str] = []

    class Config:
        from_attributes = True

class AuthResponseSchema(BaseModel):
    token: str
    user: UserOutSchema
    message: str
