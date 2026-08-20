from rest_framework import serializers

from apps.categories.serializers import CategorySerializer
from .models import Bill, BillProof


def _display_name(user):
    if not user:
        return "Unknown"
    return user.first_name or user.username or user.email


class BillProofSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = BillProof
        fields = (
            "id", "bill", "paid_amount", "paid_date", "notes", "proof_file",
            "status", "uploaded_by_name", "created_at",
        )
        read_only_fields = ("status",)

    def get_uploaded_by_name(self, obj):
        return _display_name(obj.uploaded_by)


class BillSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    payment_proofs = BillProofSerializer(many=True, read_only=True)

    class Meta:
        model = Bill
        fields = (
            "id", "title", "biller_name", "category", "category_detail", "amount", "due_date",
            "billing_period", "notes", "bill_file", "status", "uploaded_by_name",
            "payment_proofs", "created_at",
        )
        read_only_fields = ("status",)

    def get_uploaded_by_name(self, obj):
        return _display_name(obj.uploaded_by)
