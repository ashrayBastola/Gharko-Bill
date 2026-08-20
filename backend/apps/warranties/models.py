from datetime import date

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.family.models import Family


def receipt_upload_path(instance, filename):
    return f"warranties/{instance.family_id}/{filename}"


class Warranty(BaseModel):
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="warranties")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="warranties_uploaded")

    product_name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255, blank=True)
    purchase_date = models.DateField()
    warranty_expiry = models.DateField()
    receipt_file = models.FileField(upload_to=receipt_upload_path, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["warranty_expiry"]

    @property
    def is_expired(self):
        return self.warranty_expiry < date.today()

    @property
    def days_to_expiry(self):
        return (self.warranty_expiry - date.today()).days

    def __str__(self):
        return self.product_name
