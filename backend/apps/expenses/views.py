from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import HasFamily, get_user_family
from apps.core.services import log_activity
from .models import Document
from .serializers import DocumentSerializer


class DocumentListCreateView(ListCreateAPIView):
    """GET/POST /api/documents/"""
    serializer_class = DocumentSerializer
    permission_classes = (IsAuthenticated, HasFamily)

    def get_queryset(self):
        return Document.objects.filter(family=get_user_family(self.request.user))

    def perform_create(self, serializer):
        family = get_user_family(self.request.user)
        document = serializer.save(family=family, uploaded_by=self.request.user)
        log_activity(family, self.request.user, "uploaded a document:", document.title)
