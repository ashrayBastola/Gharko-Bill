from datetime import date

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import HasFamily, IsFamilyAdmin, get_user_family
from .models import FamilyMember
from .serializers import FamilySerializer


class FamilyMeView(APIView):
    """GET /api/households/me/ — the caller's household, with its member list."""
    permission_classes = (IsAuthenticated, HasFamily)

    def get(self, request):
        family = get_user_family(request.user)
        return Response(FamilySerializer(family).data)


class FamilyMemberDeleteView(APIView):
    """DELETE /api/households/members/<id>/ — admin-only member removal."""
    permission_classes = (IsAuthenticated, IsFamilyAdmin)

    def delete(self, request, pk):
        family = get_user_family(request.user)
        membership = get_object_or_404(FamilyMember, id=pk, family=family)
        if membership.user_id == request.user.id:
            return Response({"detail": "You can't remove yourself from the household."}, status=400)
        if membership.role == FamilyMember.Role.ADMIN:
            return Response({"detail": "The household admin can't be removed."}, status=400)
        membership.delete()
        return Response(status=204)


class FamilyDashboardView(APIView):
    """GET /api/households/dashboard/ — aggregated summary for the dashboard page."""
    permission_classes = (IsAuthenticated, HasFamily)

    def get(self, request):
        from apps.bills.models import Bill
        from apps.budgets.models import Budget
        from apps.budgets.serializers import BudgetSerializer
        from apps.warranties.models import Warranty
        from apps.expenses.models import Document
        from apps.notifications.models import Notification
        from apps.core.models import ActivityLog
        from apps.core.views import ActivityLogSerializer

        family = get_user_family(request.user)
        today = date.today()

        bills_qs = Bill.objects.filter(family=family)
        bills_summary = {
            "unpaid": bills_qs.filter(status="unpaid").count(),
            "pending_verification": bills_qs.filter(status="pending_verification").count(),
            "paid": bills_qs.filter(status="paid").count(),
            "total_due": sum((b.amount for b in bills_qs.exclude(status="paid")), start=0),
        }

        budgets_qs = Budget.objects.filter(family=family, month__year=today.year, month__month=today.month)
        budgets_data = BudgetSerializer(budgets_qs.select_related("category"), many=True).data

        warranties_qs = Warranty.objects.filter(family=family)
        expiring_warranties = [w for w in warranties_qs if not w.is_expired and w.days_to_expiry <= 60]
        expiring_warranties.sort(key=lambda w: w.days_to_expiry)

        documents_qs = Document.objects.filter(family=family, expiry_date__isnull=False)
        expiring_documents = [
            d for d in documents_qs if d.days_to_expiry is not None and 0 <= d.days_to_expiry <= 60
        ]
        expiring_documents.sort(key=lambda d: d.days_to_expiry)

        unread_notifications = Notification.objects.filter(user=request.user, is_read=False).count()
        recent_activity = ActivityLog.objects.filter(family=family).select_related("actor")[:8]

        return Response({
            "bills": bills_summary,
            "budgets": budgets_data,
            "expiring_warranties": [
                {"id": w.id, "product_name": w.product_name, "days_to_expiry": w.days_to_expiry}
                for w in expiring_warranties[:5]
            ],
            "expiring_documents": [
                {"id": d.id, "title": d.title, "days_to_expiry": d.days_to_expiry}
                for d in expiring_documents[:5]
            ],
            "unread_notifications": unread_notifications,
            "recent_activity": ActivityLogSerializer(recent_activity, many=True).data,
        })
