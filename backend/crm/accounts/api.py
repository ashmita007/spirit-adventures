from ninja import Router
from django.db.models import Count, Sum
from ninja.errors import HttpError
from typing import List, Optional
from .models import CustomUser
from .schemas import (
    LoginSchema, RegisterSchema, UserOutSchema, AuthResponseSchema,
    UserUpdateSchema
)
from .auth import AuthBearer, ManagerBearer

router = Router(tags=["CRM Team"])

def serialize_user(user: CustomUser) -> dict:
    is_mgr = user.is_manager_or_admin
    
    if is_mgr:
        permissions = [
            "all",
            "view_all_enquiries",
            "manage_enquiries",
            "delete_enquiries",
            "reassign_enquiries",
            "manage_users",
            "manage_targets",
            "view_financials",
            "export_data",
        ]
    else:
        permissions = [
            "view_assigned_enquiries",
            "manage_assigned_enquiries",
            "add_comments",
            "record_payments",
            "update_followups",
        ]

    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": user.role,
        "display_name": user.display_name,
        "target_amount": user.target_amount,
        "is_approved": user.is_approved,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "is_manager_or_admin": is_mgr,
        "permissions": permissions,
    }

ALLOWED_ROLES = {"sales_person", "counselor", "manager", "admin"}


@router.post("/users/", auth=ManagerBearer(), response={201: UserOutSchema, 400: dict, 403: dict})
def create_team_member(request, data: RegisterSchema):
    """
    Add a CRM team member (Manager/Admin only). Public sign-up is disabled:
    every account is created by a manager, so nobody can give themselves a role.
    """
    email = data.email.lower().strip()
    if CustomUser.objects.filter(email__iexact=email).exists():
        return 400, {"message": "An account with this email already exists."}
    role = data.role or "sales_person"
    if role not in ALLOWED_ROLES:
        return 400, {"message": "Unknown role."}
    if role == "admin" and not request.user.is_superuser:
        return 403, {"message": "Only a superuser can create admin accounts."}
    if len(data.password or "") < 8:
        return 400, {"message": "Password must be at least 8 characters."}

    user = CustomUser.objects.create_user(
        email=email,
        password=data.password,
        first_name=data.first_name.strip(),
        last_name=(data.last_name or "").strip(),
        phone=(data.phone or "").strip(),
        role=role,
        is_approved=True,
        target_amount=data.target_amount or 200000.00,
    )
    return 201, serialize_user(user)

@router.get("/auth/me", auth=AuthBearer(), response=UserOutSchema)
@router.get("/auth/me/", auth=AuthBearer(), response=UserOutSchema)
def get_current_user(request):
    return serialize_user(request.user)

@router.get("/salespersons/", auth=AuthBearer(), response=List[UserOutSchema])
def list_salespersons(request):
    """
    Public/authenticated list of active sales reps for assignment dropdowns.
    """
    users = CustomUser.objects.filter(is_active=True).order_by('first_name')
    return [serialize_user(u) for u in users]

# RBAC: Manager/Admin Protected User Management Endpoints
@router.get("/users/", auth=ManagerBearer(), response=List[UserOutSchema])
def list_all_users(request):
    """
    Lists all users for team administration (Manager/Admin only).
    """
    users = CustomUser.objects.all().order_by('-is_superuser', 'role', 'first_name')
    return [serialize_user(u) for u in users]

@router.patch("/users/{id}", auth=ManagerBearer(), response={200: UserOutSchema, 404: dict})
def update_user(request, id: int, data: UserUpdateSchema):
    """
    Update user role, target amount, or approval status (Manager/Admin only).
    """
    try:
        user = CustomUser.objects.get(id=id)
    except CustomUser.DoesNotExist:
        return 404, {"message": "User not found"}

    update_dict = data.dict(exclude_unset=True)
    if user.is_superuser and not request.user.is_superuser:
        return 404, {"message": "User not found"}
    if update_dict.get("role") == "admin" and not request.user.is_superuser:
        raise HttpError(403, "Only a superuser can grant the admin role.")
    if update_dict.get("role") and update_dict["role"] not in ALLOWED_ROLES:
        raise HttpError(400, "Unknown role.")
    for field, val in update_dict.items():
        setattr(user, field, val)
    user.save()

    return 200, serialize_user(user)

@router.post("/users/{id}/approve", auth=ManagerBearer(), response={200: UserOutSchema, 404: dict})
def approve_user(request, id: int):
    """
    Approve pending counselor/salesperson registration (Manager/Admin only, mirroring Couspro).
    """
    try:
        user = CustomUser.objects.get(id=id)
        user.is_approved = True
        user.save()
        return 200, serialize_user(user)
    except CustomUser.DoesNotExist:
        return 404, {"message": "User not found"}

@router.post("/users/{id}/toggle-active", auth=ManagerBearer(), response={200: UserOutSchema, 404: dict})
def toggle_user_active(request, id: int):
    """
    Toggle user active status (Manager/Admin only).
    """
    try:
        user = CustomUser.objects.get(id=id)
        if user.is_superuser and not request.user.is_superuser:
            raise HttpError(403, "Only a superuser can change this account.")
        if user == request.user:
            raise HttpError(400, "Cannot deactivate your own account.")
        user.is_active = not user.is_active
        user.save()
        return 200, serialize_user(user)
    except CustomUser.DoesNotExist:
        return 404, {"message": "User not found"}
