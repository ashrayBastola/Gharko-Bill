from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.categories.models import Category
from apps.family.models import Family


def bill_upload_path(instance, filename):
    return f"bills/{instance.family_id}/{filename}"


def proof_upload_path(instance, filename):
    return f"bill_proofs/{instance.bill.family_id}/{filename}"


class Bill(BaseModel):
    class Status(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PENDING_VERIFICATION = "pending_verification", "Pending verification"
        PAID = "paid", "Paid"

    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="bills")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="bills")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="bills_uploaded")

    title = models.CharField(max_length=255)
    biller_name = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    billing_period = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    bill_file = models.FileField(upload_to=bill_upload_path, null=True, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.UNPAID)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.family.name}"


class BillProof(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="payment_proofs")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="bill_proofs_uploaded")
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_date = models.DateField()
    notes = models.TextField(blank=True)
    proof_file = models.FileField(upload_to=proof_upload_path, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="bill_proofs_verified")
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Proof for {self.bill.title} ({self.status})"
