from rest_framework.permissions import BasePermission


def get_membership(user):
    """Return the user's (first / primary) FamilyMember record, or None."""
    from apps.family.models import FamilyMember

    if not user or not user.is_authenticated:
        return None
    return FamilyMember.objects.filter(user=user).select_related("family").first()


def get_user_family(user):
    membership = get_membership(user)
    return membership.family if membership else None


def get_user_role(user):
    membership = get_membership(user)
    return membership.role if membership else None


def is_family_admin(user):
    return get_user_role(user) == "ADMIN"


class HasFamily(BasePermission):
    """Require the requesting user to belong to a family."""
    message = "You need to create or join a household before using this feature."

    def has_permission(self, request, view):
        return get_membership(request.user) is not None


class IsFamilyAdmin(BasePermission):
    """Require the requesting user to be the ADMIN of their family."""
    message = "Only the household admin can perform this action."

    def has_permission(self, request, view):
        return is_family_admin(request.user)
