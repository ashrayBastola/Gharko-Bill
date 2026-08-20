from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "family", "document_type", "expiry_date")
    list_filter = ("document_type", "family")
