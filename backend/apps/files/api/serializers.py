from rest_framework import serializers
from ..models import ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    """
    Secure serializer — NEVER exposes raw Cloudinary URLs.
    Frontend must call /files/<id>/download/ or /files/<id>/preview/ to get signed URLs.
    """
    size = serializers.SerializerMethodField()
    is_previewable = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProjectFile
        fields = [
            'id',
            'name',
            'resource_type',
            'created_at',
            'size',
            'is_previewable',
        ]
        read_only_fields = ['created_at']

    def get_size(self, obj):
        if obj.file_size:
            return obj.file_size
        try:
            return obj.file.size if obj.file else 0
        except Exception:
            return 0
