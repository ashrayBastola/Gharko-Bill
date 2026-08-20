from datetime import date

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.family.models import Family


def document_upload_path(instance, filename):
    return f"documents/{instance.family_id}/{filename}"


class Document(BaseModel):
    """
    Secure document vault: citizenship/ID, insurance policies, licenses,
    contracts, and other important household paperwork.
    """
    class DocumentType(models.TextChoices):
        ID = "id", "Citizenship / ID"
        INSURANCE = "insurance", "Insurance"
        LICENSE = "license", "License"
        CONTRACT = "contract", "Contract"
        OTHER = "other", "Other"

    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="documents")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="documents_uploaded")

    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.OTHER)
    issued_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    file = models.FileField(upload_to=document_upload_path)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def days_to_expiry(self):
        if not self.expiry_date:
            return None
        return (self.expiry_date - date.today()).days

    def __str__(self):
        return self.title
