from django.db import models

from apps.core.models import BaseModel
from apps.family.models import Family

DEFAULT_CATEGORIES = [
    ("Electricity", "zap", "#F4B400"),
    ("Water", "droplet", "#1F9AD6"),
    ("Internet", "wifi", "#6366F1"),
    ("Gas", "flame", "#DC2626"),
    ("Grocery", "shopping-cart", "#16A34A"),
    ("House Rent", "home", "#B08D57"),
    ("EMI", "credit-card", "#7C3AED"),
    ("School Fees", "graduation-cap", "#0EA5E9"),
    ("Insurance", "shield", "#0D9488"),
    ("Medical", "heart-pulse", "#E11D48"),
    ("Other", "tag", "#6B7280"),
]


class Category(BaseModel):
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ("family", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.family.name})"


def create_default_categories(family):
    Category.objects.bulk_create(
        [Category(family=family, name=name, icon=icon, color=color) for name, icon, color in DEFAULT_CATEGORIES]
    )
