from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import MeSerializer, RegisterSerializer

User = get_user_model()


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": MeSerializer(user).data,
                "tokens": _tokens_for(user),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """POST /api/auth/login/  { email, password } -> { user, tokens }"""
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")

        if not email or not password:
            return Response({"non_field_errors": ["Email and password are required."]}, status=400)

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({"non_field_errors": ["Invalid email or password."]}, status=400)

        return Response({
            "user": MeSerializer(user).data,
            "tokens": _tokens_for(user),
        })


class MeView(RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/"""
    serializer_class = MeSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user
