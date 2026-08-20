from django.contrib import admin

from .models import Family, FamilyMember


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ("name", "admin", "invite_code", "created_at")
    search_fields = ("name", "invite_code", "admin__email")


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "family", "role", "created_at")
    list_filter = ("role", "family")
