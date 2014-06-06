from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods
from member.models import Member

import logging

logger = logging.getLogger('curve')

def get_request_post_str(request, name):
    """
    Get a string from request POST if exists.
    If give name is none or not a string or an empty string, None will return.
    If there's no value stored in request.POST, None will return.
    If value stored in request.POST is not a string, a string converted by that
    value will return.
    """
    if name is not None and type(name) == str and name.strip() != '' and name in request.POST:
        value = request.POST[name]
        if type(value) != str:
            value = str(value)
        return value
    return None

@require_http_methods(['POST'])
def register(request):
    """
    Register a new member.
    When register a new member, if given fullname or email already in use,
    register will be redirected to welcome page and display an alert to notify
    that given name or email already taken.
    If fullname and email is available, create a django user, and an associated
    member, and then redirect new registered member to home page.
    """
    fullname = checkNull(get_request_post_str(request, 'fullname'))
    email = checkNull(get_request_post_str(request, 'email'))
    password = checkNull(get_request_post_str(request, 'password'))

    # Ensure required fields are all non-empty.
    for name, value in { 'Name': fullname, 'Email': email, 'Password': password }.items():
        if not value:
            request.session['error'] = name + ' can NOT be empty.'
            return redirect('/')

    # Check if username or email already exists.
    if not Member.objects.check_user_and_email(fullname, email):
        logger.debug('user %s already exists.', fullname)
        request.session['error'] = 'User name or email already taken.'
    else:
        # create member.
        member = Member.objects.create_member(fullname, email, password)
        # automatically login when signup.
        user = authenticate(username=fullname, password=password)
        if user is not None:
            login(request, user)
            request.session['userid'] = user.id
            request.session['username'] = member.username

    return redirect('/')

def checkNull(obj):
    """
    Check given object is a non empty string.
    @return False if obj is None or obj is not a string,
    return None if obj is an empty string,
    return stripped whitespaces string if obj is a non empty string.
    """
    return obj is not None and type(obj) == str and obj.strip() or None

@login_required
def mostActive(request):
    actives = Member.objects.all()[:5];
    return render(request, 'member/menuitems.html', { 'members': actives });
