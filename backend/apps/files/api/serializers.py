from rest_framework import serializers
from ..models import ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    filename = serializers.SerializerMethodField()
    extension = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    uploaded_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = ProjectFile
        fields = [
            'id', 
            'project', 
            'file', 
            'filename', 
            'size', 
            'uploaded_by', 
            'uploaded_by_name', 
            'uploaded_at',
            'created_at',
            'original_name',
            'extension',
            'download_url'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'uploaded_at', 'original_name']

    def get_filename(self, obj):
        # Defensive check in case migration hasn't run on production server
        try:
            if hasattr(obj, 'original_name') and obj.original_name:
                return obj.original_name
        except:
            pass
        return obj.file.name.split('/')[-1]

    def get_extension(self, obj):
        return obj.file.name.split('.')[-1] if '.' in obj.file.name else ""

    def get_download_url(self, obj):
        url = obj.file.url
        if "/image/upload/" in url:
            # Force download transformation
            return url.replace("/image/upload/", "/image/upload/fl_attachment/")
        return url

    def get_size(self, obj):
        try:
            return obj.file.size
        except:
            return 0

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.email
        return "System"
