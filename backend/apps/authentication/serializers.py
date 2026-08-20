from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.core.permissions import get_user_role
from apps.family.models import Family, FamilyMember

User = get_user_model()


class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    household_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name",
            "phone_number", "role", "household_name",
        )
        read_only_fields = ("id", "role", "household_name")

    def get_role(self, obj):
        role = get_user_role(obj)
        return role.lower() if role else None

    def get_household_name(self, obj):
        membership = FamilyMember.objects.filter(user=obj).select_related("family").first()
        return membership.family.name if membership else None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    # Extra onboarding fields
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    household_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    invite_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'household_name', 'invite_code')
        extra_kwargs = {'username': {'required': False}}

    def validate(self, attrs):
        household_name = attrs.get('household_name')
        invite_code = attrs.get('invite_code')
        if not household_name and not invite_code:
            raise serializers.ValidationError(
                {"household_name": "Provide a household name to create one, or an invite code to join one."}
            )
        if invite_code and not Family.objects.filter(invite_code=invite_code.upper()).exists():
            raise serializers.ValidationError({"invite_code": "That invite code doesn't match any household."})
        return attrs

    def create(self, validated_data):
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        household_name = validated_data.pop('household_name', '')
        invite_code = validated_data.pop('invite_code', '')
        username = validated_data.pop('username', '') or None

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=username,
            first_name=first_name,
            last_name=last_name,
        )

        if household_name:
            from apps.categories.models import create_default_categories

            family = Family.objects.create(name=household_name, admin=user)
            FamilyMember.objects.create(family=family, user=user, role=FamilyMember.Role.ADMIN)
            create_default_categories(family)
        elif invite_code:
            family = Family.objects.get(invite_code=invite_code.upper())
            FamilyMember.objects.create(family=family, user=user, role=FamilyMember.Role.MEMBER)

        return user
