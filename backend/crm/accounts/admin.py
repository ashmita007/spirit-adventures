from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import CustomUser


class TeamMemberCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ("email", "first_name", "last_name", "role")


class TeamMemberChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = "__all__"


@admin.register(CustomUser)
class TeamMemberAdmin(UserAdmin):
    """Team accounts: one login for the owner portal (staff), the CRM and this admin."""

    add_form = TeamMemberCreationForm
    form = TeamMemberChangeForm
    model = CustomUser
    ordering = ("-is_superuser", "role", "first_name")
    list_display = ("email", "display_name", "role", "is_staff", "is_approved", "is_active")
    list_filter = ("role", "is_staff", "is_approved", "is_active")
    search_fields = ("email", "first_name", "last_name", "phone")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("first_name", "last_name", "phone")}),
        ("CRM", {"fields": ("role", "is_approved", "target_amount")}),
        (
            "Access",
            {
                "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
                "description": "Staff = can open the owner portal and Django admin. "
                "Every active, approved member can use the CRM.",
            },
        ),
        ("Dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name", "role", "password1", "password2"),
            },
        ),
    )
