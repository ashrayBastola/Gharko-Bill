from django.urls import path

from .views import BudgetListCreateView

urlpatterns = [
    path("", BudgetListCreateView.as_view(), name="budget_list_create"),
]
