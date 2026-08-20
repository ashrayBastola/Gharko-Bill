from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    days_to_expiry = serializers.ReadOnlyField()

    class Meta:
        model = Document
        fields = (
            "id", "title", "document_type", "issued_date", "expiry_date",
            "file", "notes", "uploaded_by_name", "days_to_expiry", "created_at",
        )

    def get_uploaded_by_name(self, obj):
        if not obj.uploaded_by:
            return "Unknown"
        return obj.uploaded_by.first_name or obj.uploaded_by.username or obj.uploaded_by.email
