from django.shortcuts import render
from .models import BakeryItem

#def home(request):
#    bakery_items = BakeryItem.objects.all()  # Fetch all bakery items
#    return render(request, 'home.html', {'bakery_items': bakery_items})

def index(request):
    return render(request, 'index.html')