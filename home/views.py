# Create your views here.
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import logging

logger = logging.getLogger('curve')

@login_required
@require_http_methods(['GET', 'POST'])
def home(request):
    context = {}
    context['ajax'] = request.is_ajax()
    return render(request, 'home/home.html', context)
