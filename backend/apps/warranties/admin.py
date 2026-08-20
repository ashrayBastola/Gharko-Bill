from django.contrib import admin

from .models import Warranty


@admin.register(Warranty)
class WarrantyAdmin(admin.ModelAdmin):
    list_display = ("product_name", "family", "purchase_date", "warranty_expiry")
    list_filter = ("family",)
