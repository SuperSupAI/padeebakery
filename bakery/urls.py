from django.urls import path
from . import views

urlpatterns = [
    # URL สำหรับหน้าหลัก/หน้าออกแบบขนมปัง
    path('', views.bread_builder_view, name='bread_builder'),
    
    # path('order/submit/', views.submit_order, name='submit_order_api'), # For later backend logic
]