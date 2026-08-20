from .models import Notification


def notify_family(family, title, message="", exclude_user=None):
    """Create a notification for every member of a family (optionally excluding one user)."""
    if not family:
        return
    memberships = family.members.select_related("user").all()
    notifications = [
        Notification(family=family, user=m.user, title=title, message=message)
        for m in memberships
        if not exclude_user or m.user_id != exclude_user.id
    ]
    if notifications:
        Notification.objects.bulk_create(notifications)
