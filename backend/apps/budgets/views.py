from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import HasFamily, IsFamilyAdmin, get_user_family
from apps.core.services import log_activity
from .models import Budget
from .serializers import BudgetSerializer


class BudgetListCreateView(ListCreateAPIView):
    """GET /api/budgets/ (any member) — POST /api/budgets/ (admin only)"""
    serializer_class = BudgetSerializer
    permission_classes = (IsAuthenticated, HasFamily)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsFamilyAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        return Budget.objects.filter(family=get_user_family(self.request.user)).select_related("category")

    def perform_create(self, serializer):
        family = get_user_family(self.request.user)
        budget = serializer.save(family=family)
        log_activity(family, self.request.user, "set a monthly budget for", budget.category.name if budget.category else "the household")
