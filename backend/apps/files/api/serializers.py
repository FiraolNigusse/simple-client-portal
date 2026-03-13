from rest_framework import serializers
from ..models import ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.get_full_name')
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFile
        fields = [
            'id', 
            'project', 
            'file', 
            'file_name', 
            'file_size', 
            'uploaded_by', 
            'uploaded_by_name', 
            'created_at'
        ]
        read_only_fields = ['uploaded_by', 'created_at']

    def get_file_name(self, obj):
        return obj.file.name.split('/')[-1]

    def get_file_size(self, obj):
        try:
            return obj.file.size
        except:
            return 0
