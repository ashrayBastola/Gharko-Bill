from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import HasFamily, IsFamilyAdmin, get_user_family, is_family_admin
from apps.core.services import log_activity
from apps.notifications.services import notify_family
from .models import Bill, BillProof
from .serializers import BillProofSerializer, BillSerializer


class BillListCreateView(ListCreateAPIView):
    """GET/POST /api/bills/"""
    serializer_class = BillSerializer
    permission_classes = (IsAuthenticated, HasFamily)

    def get_queryset(self):
        return (
            Bill.objects.filter(family=get_user_family(self.request.user))
            .select_related("category", "uploaded_by")
            .prefetch_related("payment_proofs", "payment_proofs__uploaded_by")
        )

    def perform_create(self, serializer):
        family = get_user_family(self.request.user)
        bill = serializer.save(family=family, uploaded_by=self.request.user)
        log_activity(family, self.request.user, "added a bill", bill.title)
        notify_family(
            family, exclude_user=self.request.user,
            title="New bill added",
            message=f"{bill.title} — Rs. {bill.amount} due {bill.due_date}",
        )


class BillProofCreateView(ListCreateAPIView):
    """POST /api/bills/proofs/"""
    serializer_class = BillProofSerializer
    permission_classes = (IsAuthenticated, HasFamily)

    def get_queryset(self):
        return BillProof.objects.filter(bill__family=get_user_family(self.request.user))

    def perform_create(self, serializer):
        family = get_user_family(self.request.user)
        bill = get_object_or_404(Bill, id=self.request.data.get("bill"), family=family)
        proof = serializer.save(bill=bill, uploaded_by=self.request.user)
        bill.status = Bill.Status.PENDING_VERIFICATION
        bill.save(update_fields=["status"])
        log_activity(family, self.request.user, "submitted a payment proof for", bill.title)
        notify_family(
            family, exclude_user=self.request.user,
            title="Payment proof submitted",
            message=f"{bill.title} — awaiting verification",
        )
        return proof


class BillProofVerifyView(APIView):
    """POST /api/bills/proofs/<id>/verify/  { decision: 'approve' | 'reject' }"""
    permission_classes = (IsAuthenticated, IsFamilyAdmin)

    def post(self, request, pk):
        family = get_user_family(request.user)
        proof = get_object_or_404(BillProof, id=pk, bill__family=family)
        decision = request.data.get("decision")

        if decision not in ("approve", "reject"):
            return Response({"detail": "decision must be 'approve' or 'reject'."}, status=400)

        proof.status = BillProof.Status.APPROVED if decision == "approve" else BillProof.Status.REJECTED
        proof.verified_by = request.user
        proof.verified_at = timezone.now()
        proof.save(update_fields=["status", "verified_by", "verified_at"])

        bill = proof.bill
        bill.status = Bill.Status.PAID if decision == "approve" else Bill.Status.UNPAID
        bill.save(update_fields=["status"])

        log_activity(family, request.user, f"{decision}d the payment proof for", bill.title)
        return Response(BillProofSerializer(proof).data)
