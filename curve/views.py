from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from datetime import datetime
from member.models import Member
import logging

logger = logging.getLogger('curve')

def home(request):
    """
    Main page.
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
        error = request.session.get('error', None)
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
    Save 'user.id' in session with key 'userid', last login with key 'last_login',
    'member.username' with key 'username' after if loggin succeeded.
    """
    username = request.POST['username']
    password = request.POST['password']
    logger.debug('Authenticating %s...', username)
    user = authenticate(username=username, password=password)
    if user is not None and user.is_active:
        logger.debug("User authenticated and active, logging in...")
        login(request, user)
        # Set Session Expiry to 0 if user clicks "Remember Me"
        if not request.POST.get('rem', None):
            request.session.set_expiry(0)
        member = Member.objects.get(user=user)
        request.session['userid'] = user.id
        request.session['username'] = member.username            
    else:
        request.session['error'] = "There was an error logging you in. Please Try again."
    request.session['last_login'] = datetime.now()
    return redirect('/')
# pass

def signout(request):
    """
    Sign out.
    Remove remembered from session, and redirect to main page.
    """
    for key in ['userid', 'username', 'error']:
        if key in request.session:
            del request.session[key]
    # django auth logout.
    logout(request)
    return redirect('/')
# pass

def connect(request):
    return HttpResponse('test')
