from .models import AuditLog

def log_portal_event(request, client, action, resource_type, resource_id, metadata=None):
    """
    Utility to record an audit log entry for portal actions.
    """
    AuditLog.objects.create(
        client=client,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata or {},
        ip_address=request.META.get("REMOTE_ADDR"),
        user_agent=request.META.get("HTTP_USER_AGENT", ""),
    )

def track_event(user, event_type, metadata=None):
    """
    Utility to record generic user-driven events for analytics.
    Ensures safe import to avoid circular dependencies.
    """
    from .models import Event
    return Event.objects.create(
        user=user,
        type=event_type,
        metadata=metadata or {}
    )
