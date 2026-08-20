from django.urls import path

from .views import FamilyDashboardView, FamilyMeView, FamilyMemberDeleteView

urlpatterns = [
    path("me/", FamilyMeView.as_view(), name="family_me"),
    path("dashboard/", FamilyDashboardView.as_view(), name="family_dashboard"),
    path("members/<uuid:pk>/", FamilyMemberDeleteView.as_view(), name="family_member_delete"),
]
