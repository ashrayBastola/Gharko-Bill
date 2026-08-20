from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "actor", "verb", "target_repr", "family")
    list_filter = ("family",)
    search_fields = ("verb", "target_repr")
