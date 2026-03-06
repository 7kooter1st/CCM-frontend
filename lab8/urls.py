from django.contrib import admin
from django.urls import path
from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('calculate/', views.calculate_total_power, name='calculate-total-power'),
]
