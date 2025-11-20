# weather_api/models.py
from django.db import models
from django.contrib.auth.models import User

class FavoriteLocation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    city_name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    added_on = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'latitude', 'longitude')
    def __str__(self):
        return f"{self.user.username} - {self.city_name}"