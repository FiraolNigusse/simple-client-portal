from rest_framework import serializers
from ..models import ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.get_full_name')
    filename = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
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
            'original_name'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'uploaded_at', 'original_name']

    def get_filename(self, obj):
        if obj.original_name:
            return obj.original_name
        return obj.file.name.split('/')[-1]

    def get_size(self, obj):
        try:
            return obj.file.size
        except:
            return 0
