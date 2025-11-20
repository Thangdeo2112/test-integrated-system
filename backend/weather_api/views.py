# backend/weather_api/views.py

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import FavoriteLocation
from .serializers import FavoriteLocationSerializer, RegisterSerializer
from datetime import datetime

# URL API của Open-Meteo
WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'
GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'

# 1. API Tìm kiếm thành phố 
class SearchCityView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request, *args, **kwargs):
        city = request.query_params.get('city', None)
        if not city:
            return Response({"error": "Cần có tên thành phố."}, status=status.HTTP_400_BAD_REQUEST)
        
        geo_params = {'name': city, 'count': 10, 'language': 'vi', 'format': 'json'}
        
        try:
            geo_response = requests.get(GEOCODING_API_URL, params=geo_params)
            geo_response.raise_for_status()
            geo_data = geo_response.json()

            if not geo_data.get('results'):
                return Response({"error": f"Không tìm thấy kết quả nào cho '{city}'."}, status=status.HTTP_404_NOT_FOUND)
            
            locations = []
            for res in geo_data['results']:
                locations.append({
                    'id': res['id'],
                    'name': res.get('name', 'Không rõ tên'),
                    'country': res.get('country', ''),
                    'admin1': res.get('admin1', ''),
                    'latitude': res['latitude'],
                    'longitude': res['longitude'],
                })
            return Response(locations, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Lỗi server: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 2. API Thời tiết (ĐÃ CẬP NHẬT: Current, Daily 7 ngày, Hourly 24h)
class WeatherDataView(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = []
    
    def get(self, request, *args, **kwargs):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        if not lat or not lon:
            return Response({"error": "Cần có 'lat' và 'lon'."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            weather_params = {
                'latitude': lat,
                'longitude': lon,
                # 1. Thông tin hiện tại
                'current': 'temperature_2m,relative_humidity_2m,precipitation,weathercode,windspeed_10m,winddirection_10m,pressure_msl',
                # 2. Dự báo 7 ngày
                'daily': 'weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum',
                # 3. (MỚI) Dự báo từng giờ (cho biểu đồ)
                'hourly': 'temperature_2m,weathercode,precipitation',
                'timezone': 'auto'
            }
            
            response = requests.get(WEATHER_API_URL, params=weather_params)
            response.raise_for_status()
            data = response.json()

            # --- XỬ LÝ CURRENT ---
            current = data.get('current', {})
            
            # --- XỬ LÝ DAILY (7 Ngày) ---
            daily = data.get('daily', {})
            forecast_list = []
            if 'time' in daily:
                for i in range(len(daily['time'])):
                    forecast_list.append({
                        'date': daily['time'][i],
                        'max_temp': daily['temperature_2m_max'][i],
                        'min_temp': daily['temperature_2m_min'][i],
                        'weathercode': daily['weathercode'][i],
                        'precipitation': daily['precipitation_sum'][i],
                        'sunrise': daily['sunrise'][i],
                        'sunset': daily['sunset'][i]
                    })

            # --- XỬ LÝ HOURLY (Từng giờ - MỚI THÊM) ---
            hourly = data.get('hourly', {})
            hourly_list = []
            if 'time' in hourly:
                for i in range(len(hourly['time'])):
                    # API trả về dạng "2024-11-18T14:00"
                    full_time = hourly['time'][i]
                    # Tách lấy giờ "14:00" để hiển thị cho gọn
                    time_str = full_time.split('T')[1] if 'T' in full_time else full_time
                    
                    hourly_list.append({
                        'full_time': full_time, # Dùng để lọc ngày ở Frontend
                        'time': time_str,       # Dùng để hiển thị
                        'temp': hourly['temperature_2m'][i],
                        'code': hourly['weathercode'][i],
                        'rain': hourly['precipitation'][i]
                    })

            # Tổng hợp dữ liệu trả về
            weather_data = {
                'current': {
                    'temperature': current.get('temperature_2m'),
                    'humidity': current.get('relative_humidity_2m'),
                    'precipitation': current.get('precipitation'),
                    'weathercode': current.get('weathercode'),
                    'windspeed': current.get('windspeed_10m'),
                    'winddirection': current.get('winddirection_10m'),
                    'pressure': current.get('pressure_msl'),
                },
                'forecast': forecast_list, # Mảng dự báo 7 ngày
                'hourly': hourly_list,     # Mảng dự báo từng giờ (MỚI)
                'units': data.get('current_units', {})
            }
            
            return Response(weather_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Lỗi lấy dữ liệu: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 3. API Đăng ký
class RegisterView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": f"User '{user.username}' đã tạo thành công."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 4. API Xem & Thêm Yêu thích
class FavoriteLocationView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteLocationSerializer

    def get_queryset(self):
        return FavoriteLocation.objects.filter(user=self.request.user).order_by('-added_on')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 5. API Xóa & Sửa Yêu thích
class FavoriteLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteLocationSerializer

    def get_queryset(self):
        return FavoriteLocation.objects.filter(user=self.request.user)