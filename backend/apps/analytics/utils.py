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
