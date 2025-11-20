# backend/weather_api/urls.py
from django.urls import path
from .views import (
    SearchCityView, 
    WeatherDataView, 
    RegisterView, 
    FavoriteLocationView, 
    FavoriteLocationDetailView 
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # 1. Auth (Đăng ký & Đăng nhập)
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),       
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),

    # 2. Chức năng chính
    path('search-city/', SearchCityView.as_view(), name='search-city'),
    path('weather/', WeatherDataView.as_view(), name='weather-data'),

    # 3. Yêu thích (Thêm, Xem, Xóa)
    path('favorites/', FavoriteLocationView.as_view(), name='favorites-list'),
    path('favorites/<int:pk>/', FavoriteLocationDetailView.as_view(), name='favorites-detail'), # <--- QUAN TRỌNG: Để xóa
]