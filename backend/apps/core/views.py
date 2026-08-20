from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from apps.core.permissions import HasFamily, get_user_family
from .models import ActivityLog


class ActivityLogSerializer(ModelSerializer):
    actor_name = SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ("id", "verb", "target_repr", "actor_name", "created_at")

    def get_actor_name(self, obj):
        if not obj.actor:
            return "Someone"
        return obj.actor.first_name or obj.actor.username or obj.actor.email


class ActivityListView(ListAPIView):
    """GET /api/activity/ — recent activity for the caller's household."""
    serializer_class = ActivityLogSerializer
    permission_classes = (IsAuthenticated, HasFamily)

    def get_queryset(self):
        family = get_user_family(self.request.user)
        return ActivityLog.objects.filter(family=family).select_related("actor")[:50]
