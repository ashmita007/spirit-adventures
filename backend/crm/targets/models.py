from django.db import models
from django.conf import settings
from decimal import Decimal

class MonthlyTarget(models.Model):
    MONTH_CHOICES = (
        (1, 'January'), (2, 'February'), (3, 'March'), (4, 'April'),
        (5, 'May'), (6, 'June'), (7, 'July'), (8, 'August'),
        (9, 'September'), (10, 'October'), (11, 'November'), (12, 'December'),
    )

    year = models.IntegerField(default=2026)
    month = models.IntegerField(choices=MONTH_CHOICES, default=10)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('500000.00'))
    sales_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='monthly_targets',
        help_text="Null for overall company target"
    )
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('year', 'month', 'sales_person')

    def __str__(self):
        sp = self.sales_person.display_name if self.sales_person else "Company Overall"
        return f"{self.get_month_display()} {self.year} Target for {sp}: ₹{self.target_amount}"
