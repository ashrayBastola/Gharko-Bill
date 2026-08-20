from rest_framework import serializers

from apps.bills.models import Bill
from apps.categories.serializers import CategorySerializer
from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    spent_amount = serializers.SerializerMethodField()
    percent_used = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = (
            "id", "category", "category_detail", "month", "limit_amount",
            "spent_amount", "percent_used",
        )

    def get_spent_amount(self, obj):
        qs = Bill.objects.filter(
            family=obj.family, status="paid",
            due_date__year=obj.month.year, due_date__month=obj.month.month,
        )
        if obj.category_id:
            qs = qs.filter(category_id=obj.category_id)
        total = sum((b.amount for b in qs), start=0)
        return total

    def get_percent_used(self, obj):
        spent = self.get_spent_amount(obj)
        if not obj.limit_amount:
            return 0
        return round(float(spent) / float(obj.limit_amount) * 100)
