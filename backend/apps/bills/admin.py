from django.contrib import admin

from .models import Bill, BillProof


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("title", "family", "amount", "due_date", "status")
    list_filter = ("status", "family")
    search_fields = ("title", "biller_name")


@admin.register(BillProof)
class BillProofAdmin(admin.ModelAdmin):
    list_display = ("bill", "paid_amount", "paid_date", "status")
    list_filter = ("status",)
