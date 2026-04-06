from rest_framework import serializers
from ..models import ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    """
    Secure serializer — NEVER exposes raw Cloudinary URLs.
    Frontend must call /files/<id>/download/ or /files/<id>/preview/ to get signed URLs.
    """
    uploaded_by_name = serializers.SerializerMethodField()
    filename = serializers.SerializerMethodField()
    extension = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    uploaded_at = serializers.DateTimeField(source='created_at', read_only=True)
    is_previewable = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProjectFile
        fields = [
            'id',
            'project',
            'filename',
            'extension',
            'size',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_at',
            'created_at',
            'is_previewable',
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'uploaded_at']

    def get_filename(self, obj):
        try:
            if hasattr(obj, 'original_name') and obj.original_name:
                return obj.original_name
        except Exception:
            pass
        if obj.file:
            return obj.file.name.split('/')[-1]
        # Fallback for Cloudinary-only files
        return obj.public_id.split('/')[-1] if obj.public_id else "file"

    def get_extension(self, obj):
        return obj.extension

    def get_size(self, obj):
        if obj.file_size:
            return obj.file_size
        try:
            return obj.file.size if obj.file else 0
        except Exception:
            return 0

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.name or obj.uploaded_by.email
        return "System"
