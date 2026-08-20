from django.urls import path

from .views import WarrantyListCreateView

urlpatterns = [
    path("", WarrantyListCreateView.as_view(), name="warranty_list_create"),
]
