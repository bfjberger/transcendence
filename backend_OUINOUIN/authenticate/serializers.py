from django.contrib.auth.models import User

from rest_framework import serializers

from authenticate.models import snippet

class UserSerializer(serializers.ModelSerializer):
    snippet = serializers.PrimaryKeyRelatedField(many=True, queryset=snippet.objects.all())

    class Meta:
        model = User
        fields = ['id', 'username', 'snippet']