# backend/weather_api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FavoriteLocation

# 1. Serializer cho Đăng ký 
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) 

    class Meta:
        model = User
        fields = ['username', 'password', 'email']
    
    def create(self, validated_data):
    
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        return user

# 2. Serializer cho Địa điểm yêu thích 
class FavoriteLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteLocation
        fields = ['id', 'city_name', 'latitude', 'longitude', 'added_on'] 
        read_only_fields = ['user']