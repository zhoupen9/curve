from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from datetime import datetime
import logging

logger = logging.getLogger('curve')

def home(request):
    """
    Method act as site's main page.
    According to user's login status, render proper page,
    but not change current location (meaning server do not return redirect response).
    """
    logger.debug('>> Executing home...')

    context = {}
    if request.user.is_authenticated():
        logger.debug('user name: %s, email: %s.', request.user.username, request.user.email)
        # if user already logged in, render home page.
        return render(request, 'home/home.html', context)
    else:
        # if user did not logged in, render welcome page.
        error = request.session.get('login_error', None)
        if not error is None:
            context['error'] = error
        
    return render(request, 'welcome.html', context)
# pass

@require_http_methods(['POST'])
def signin(request):
    """
    Login.
    Login view only takes request from POST, and always redirect to main page
    to prevent redundant form submit if user hit back button.
    """
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)
    if (not user is None) and user.is_active:
        # Set Session Expiry to 0 if user clicks "Remember Me"
        logger.debug("User authenticated and active, logging in...")
        login(request, user)
        if not request.POST.get('rem', None):
            request.session.set_expiry(0)
    else:
        request.session['login_error'] = "There was an error logging you in. Please Try again."
    request.session['last_login'] = datetime.now()
    return redirect('/')
# pass

def signout(request):
    """
    Sign out.
    """
    del request.session['login_error']
    logout(request)
    return redirect('/')
# pass
