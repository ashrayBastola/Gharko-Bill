from django.contrib import admin

from .models import Budget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("family", "category", "month", "limit_amount")
    list_filter = ("family", "month")
