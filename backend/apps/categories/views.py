from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import HasFamily, get_user_family
from .models import Category
from .serializers import CategorySerializer


class CategoryListCreateView(ListCreateAPIView):
    """GET/POST /api/categories/"""
    serializer_class = CategorySerializer
    permission_classes = (IsAuthenticated, HasFamily)

    def get_queryset(self):
        return Category.objects.filter(family=get_user_family(self.request.user))

    def perform_create(self, serializer):
        serializer.save(family=get_user_family(self.request.user))
