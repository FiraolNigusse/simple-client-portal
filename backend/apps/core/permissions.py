from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to view/edit it.
    The object must have a 'freelancer' field or a 'client.freelancer' relationship.
    """
    def has_object_permission(self, request, view, obj):
        # Determine the owner
        if hasattr(obj, 'freelancer'):
            return obj.freelancer == request.user
        if hasattr(obj, 'client') and hasattr(obj.client, 'freelancer'):
            return obj.client.freelancer == request.user
        if hasattr(obj, 'project') and hasattr(obj.project, 'client'):
            return obj.project.client.freelancer == request.user
        
        return False
