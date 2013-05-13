# Create your views here.
#from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import logging

logger = logging.getLogger('curve')

@login_required(login_url="/welcome", redirect_field_name="")
def home(request):
    context = {}
    return render(request, 'home/home.html', context)
