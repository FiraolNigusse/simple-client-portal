from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from ..models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "is_active", "created_at")
        read_only_fields = ("id", "is_active", "created_at")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "name", "password", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists."))
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        "no_active_account": _("Unable to log in with the provided credentials."),
    }

    def validate(self, attrs):
        data = super().validate(attrs)
        # Attach minimal user payload so the frontend can bootstrap auth state.
        data["user"] = UserSerializer(self.user).data
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError(
                _("Unable to log in with the provided credentials."),
                code="authorization",
            )
        if not user.is_active:
            raise serializers.ValidationError(_("This account is inactive."), code="inactive")
        attrs["user"] = user
        return attrs

