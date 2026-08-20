from django.db import models

from apps.core.models import BaseModel
from apps.categories.models import Category
from apps.family.models import Family


class Budget(BaseModel):
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="budgets")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name="budgets")
    month = models.DateField(help_text="Any date within the budgeted month; stored normalized to day 1.")
    limit_amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("family", "category", "month")
        ordering = ["-month"]

    def save(self, *args, **kwargs):
        if self.month:
            self.month = self.month.replace(day=1)
        super().save(*args, **kwargs)

    def __str__(self):
        cat = self.category.name if self.category else "Overall"
        return f"{cat} budget — {self.month:%B %Y}"
