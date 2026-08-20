from rest_framework import serializers

from .models import Warranty


class WarrantySerializer(serializers.ModelSerializer):
    is_expired = serializers.ReadOnlyField()
    days_to_expiry = serializers.ReadOnlyField()

    class Meta:
        model = Warranty
        fields = (
            "id", "product_name", "brand", "purchase_date", "warranty_expiry",
            "receipt_file", "notes", "is_expired", "days_to_expiry", "created_at",
        )
