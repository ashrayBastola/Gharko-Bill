from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import HasFamily, get_user_family
from apps.core.services import log_activity
from .models import Warranty
from .serializers import WarrantySerializer


class WarrantyListCreateView(ListCreateAPIView):
    """GET/POST /api/warranties/"""
    serializer_class = WarrantySerializer
    permission_classes = (IsAuthenticated, HasFamily)

    def get_queryset(self):
        return Warranty.objects.filter(family=get_user_family(self.request.user))

    def perform_create(self, serializer):
        family = get_user_family(self.request.user)
        warranty = serializer.save(family=family, uploaded_by=self.request.user)
        log_activity(family, self.request.user, "added a warranty for", warranty.product_name)
