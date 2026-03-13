from rest_framework import serializers

from apps.projects.models import Project
from ..models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            "id",
            "project",
            "title",
            "description",
            "status",
            "due_date",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_project(self, value: Project) -> Project:
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            raise serializers.ValidationError("Invalid user.")
        # Ensure the project belongs to the authenticated freelancer
        if value.client.freelancer_id != request.user.id:
            raise serializers.ValidationError("You cannot create tasks for this project.")
        return value

