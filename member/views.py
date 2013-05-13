
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.utils import simplejson
from django.shortcuts import render, redirect
import logging

logger = logging.getLogger('curve')

def welcome(request):
    """
    Welcome run when client open site first time.
    """
    if request.user.is_authenticated():
        return redirect('/home/', request)
    else:
        context = {}
        return render(request, 'templates/welcome.html', context)

def signin(request):
    """
    Login.
    """
    if request.method == 'POST':
        data = {}
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if (not user is None) and (user.is_active):
            # Set Session Expiry to 0 if user clicks "Remember Me"
            logger.debug("User authenticated and active, logging in...")
            login(request, user)
            if not request.POST.get('rem', None):
                request.session.set_expiry(0)
            data['success'] = True
            return redirect('/home');
        else:
            data['error'] = "There was an error logging you in. Please Try again"
        return HttpResponse(simplejson.dumps(data), mimetype="application/json")
    else:
        return redirect('/welcome')

def register(request):
    pass
