from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Family, FamilyMember

User = get_user_model()


class FamilyMemberSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = FamilyMember
        fields = ("id", "username", "first_name", "last_name", "email", "role")

    def get_role(self, obj):
        return obj.role.lower()


class FamilySerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ("id", "name", "invite_code", "members")

    def get_members(self, obj):
        memberships = obj.members.select_related("user").all()
        return FamilyMemberSerializer(memberships, many=True).data
