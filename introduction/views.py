
from django.shortcuts import render

def welcome(request):
    """
    Display welcome page.
    """
    context = {}
    return render(request, 'introduction/welcome.html', context)
