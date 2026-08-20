from django.urls import path

from .views import CategoryListCreateView

urlpatterns = [
    path("", CategoryListCreateView.as_view(), name="category_list_create"),
]
