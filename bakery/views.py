from django.shortcuts import render
from django.http import JsonResponse
import json

# Data (If you want to serve the data from the backend, move BREAD_DATA here)
# bakery/views.py

BREAD_DATA = {
    "base": [
        { 
            "id": 'sourdough', 
            "name": 'Sourdough', 
            "price": 120, 
            "icon": 'fa-bread-slice', 
            "desc": 'แป้งหมักธรรมชาติ เปลือกกรอบ เนื้อเหนียวนุ่ม',
            # ต้องแก้พาธรูปภาพให้ชี้ไปที่ Static Files ของ Django
            "image": '/static/bakery/img/base/sourdough.png' # <--- แก้ไข
        },
        { 
            "id": 'wholewheat', 
            "name": 'Whole Wheat 100%', 
            "price": 140, 
            "icon": 'fa-wheat-awn', 
            "desc": 'ไฟเบอร์สูง ธัญพืชเต็มเมล็ด หอมมัน',
            "image": '/static/bakery/img/base/wholewheat.png' # <--- แก้ไข
        },
        { 
            "id": 'shokupan', 
            "name": 'Shokupan Milk', 
            "price": 150, 
            "icon": 'fa-cube', 
            "desc": 'ขนมปังนมสไตล์ญี่ปุ่น นุ่มละลายในปาก',
            "image": '/static/bakery/img/base/shokupan.png' # <--- แก้ไข
        },
    ],

    "mixins": [
        { "id": 'cranberry', "name": 'แครนเบอร์รี่', "price": 30, "icon": 'fa-circle', "color": 'text-red-500', "image": '/static/bakery/img/icon/cranberry.png' }, # เพิ่ม image/icon ที่ถูกต้อง
        { "id": 'walnut', "name": 'วอลนัท', "price": 40, "icon": 'fa-brain', "color": 'text-amber-700', "image": '/static/bakery/img/icon/walnut.png' },
        { "id": 'cheese', "name": 'เชดด้าชีส', "price": 35, "icon": 'fa-cheese', "color": 'text-yellow-400', "image": '/static/bakery/img/icon/cheese.png' },
        { "id": 'chocolate', "name": 'ดาร์กช็อกโกแลต', "price": 35, "icon": 'fa-cookie', "color": 'text-gray-700', "image": '/static/bakery/img/icon/chocolate.png' },
        { "id": 'raisin', "name": 'ลูกเกดทอง', "price": 25, "icon": 'fa-cookie-bite', "color": 'text-yellow-600', "image": '/static/bakery/img/icon/raisin.png' },
        { "id": 'pumpkin', "name": 'เมล็ดฟักทอง', "price": 30, "icon": 'fa-seedling', "color": 'text-green-600', "image": '/static/bakery/img/icon/pumpkin.png' },
    ],

    "toppings": [
        { "id": 'none', "name": 'ไม่ใส่', "price": 0, "icon": 'fa-ban' },
        { "id": 'sesame', "name": 'งาขาว/ดำ', "price": 10, "icon": 'fa-ellipsis', "color": 'text-gray-800' },
        { "id": 'oats', "name": 'ข้าวโอ๊ต', "price": 15, "icon": 'fa-leaf', "color": 'text-amber-200' },
        { "id": 'icing', "name": 'ไอซิ่ง', "price": 10, "icon": 'fa-snowflake', "color": 'text-blue-200' },
    ]
}

def bread_builder_view(request):
    # 1. แปลง Python Dictionary ให้เป็น JSON String ใน Python ก่อน
    bread_data_json_string = json.dumps(BREAD_DATA)

    context = {
        # 2. ส่ง JSON String ที่ถูกจัดรูปแบบแล้วไปยัง Template
        'bread_data_json': bread_data_json_string 
    }
    return render(request, 'bakery/bread_builder.html', context)
    #return render(request, 'bakery/index.html', context)

# You might add an API endpoint later for actual order submission:
# def submit_order(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         # Process the order/save to database
#         return JsonResponse({'status': 'success', 'message': 'Order submitted!'})
#     return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)