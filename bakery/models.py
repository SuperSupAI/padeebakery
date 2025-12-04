from django.db import models
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
import json

# ==========================================
# 1. MODELS (ส่วนเก็บข้อมูลลงฐานข้อมูล)
# ==========================================

class Ingredient(models.Model):
    """เก็บข้อมูลวัตถุดิบทั้งหมด (แป้ง, ไส้, ท็อปปิ้ง)"""
    CATEGORY_CHOICES = [
        ('base', 'เนื้อแป้ง'),
        ('mixin', 'ไส้ผสม'),
        ('topping', 'ท็อปปิ้ง'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="ชื่อวัตถุดิบ")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    icon_class = models.CharField(max_length=50, help_text="ชื่อ class ของ FontAwesome", blank=True)
    is_available = models.BooleanField(default=True, verbose_name="มีของพร้อมขาย")

    def __str__(self):
        return f"{self.get_category_display()}: {self.name} ({self.price} บาท)"

class Order(models.Model):
    """ใบสั่งซื้อหลัก"""
    STATUS_CHOICES = [
        ('pending', 'รอชำระเงิน'),
        ('paid', 'ชำระเงินแล้ว'),
        ('baking', 'กำลังอบ'),
        ('shipping', 'กำลังจัดส่ง'),
        ('completed', 'สำเร็จ'),
    ]

    customer = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shipping_address = models.TextField(blank=True)

    def __str__(self):
        return f"Order #{self.id} - {self.status}"

class OrderItem(models.Model):
    """รายละเอียดขนมปังแต่ละก้อนในออเดอร์"""
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    base_dough = models.ForeignKey(Ingredient, related_name='base_for', on_delete=models.PROTECT)
    toppings = models.ForeignKey(Ingredient, related_name='topping_for', on_delete=models.SET_NULL, null=True, blank=True)
    
    # ManyToMany เพราะขนมปัง 1 ก้อน ใส่ไส้ได้หลายอย่าง
    mixins = models.ManyToManyField(Ingredient, related_name='mixins_for', blank=True)
    
    quantity = models.IntegerField(default=1)
    price_per_unit = models.DecimalField(max_digits=6, decimal_places=2)

    def calculate_price(self):
        """คำนวณราคาขนมปังก้อนนี้ (แป้ง + ไส้ + ท็อปปิ้ง)"""
        total = self.base_dough.price
        if self.toppings:
            total += self.toppings.price
        for mixin in self.mixins.all():
            total += mixin.price
        return total