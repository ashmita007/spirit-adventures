from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('role', 'manager')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('sales_person', 'Sales Person'),
        ('counselor', 'Counselor'),
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=60, blank=True)
    last_name = models.CharField(max_length=60, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sales_person')
    is_approved = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, default=200000.00)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    class Meta:
        verbose_name = 'Team member'
        verbose_name_plural = 'Team members'

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]

    @property
    def display_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email.split('@')[0].capitalize()

    @property
    def is_manager_or_admin(self) -> bool:
        return self.is_superuser or self.role in ['admin', 'manager']

    @property
    def is_sales_rep(self) -> bool:
        return self.role in ['sales_person', 'counselor']

    def can_view_enquiry(self, enquiry) -> bool:
        if self.is_manager_or_admin:
            return True
        return enquiry.sales_person_id == self.id

    def can_edit_enquiry(self, enquiry) -> bool:
        if self.is_manager_or_admin:
            return True
        return enquiry.sales_person_id == self.id

    def can_delete_enquiry(self, enquiry) -> bool:
        return self.is_manager_or_admin
