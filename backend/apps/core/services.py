from .models import ActivityLog


def log_activity(family, actor, verb, target_repr=""):
    """Create an ActivityLog entry. Never raises — logging must not break the request."""
    try:
        ActivityLog.objects.create(family=family, actor=actor, verb=verb, target_repr=target_repr)
    except Exception:
        pass
