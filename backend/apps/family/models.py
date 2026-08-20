import random
import string

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import BaseModel


def generate_invite_code():
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choices(alphabet, k=8))


class Family(BaseModel):
    name = models.CharField(_("Family Name"), max_length=255)
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="administered_families",
        help_text=_("The user who created and manages the family account.")
    )
    invite_code = models.CharField(max_length=12, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Families"

    def save(self, *args, **kwargs):
        if not self.invite_code:
            code = generate_invite_code()
            while Family.objects.filter(invite_code=code).exists():
                code = generate_invite_code()
            self.invite_code = code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (Admin: {self.admin.email})"


class FamilyMember(BaseModel):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", _("Admin")
        MEMBER = "MEMBER", _("Member")

    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="family_memberships")
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)

    class Meta:
        unique_together = ("family", "user")

    def __str__(self):
        return f"{self.user.email} - {self.family.name} ({self.role})"
