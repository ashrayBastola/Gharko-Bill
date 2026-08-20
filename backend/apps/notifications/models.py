from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.family.models import Family


class Notification(BaseModel):
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} -> {self.user}"
