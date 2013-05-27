from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.views.decorators.http import require_http_methods
from member.models import Member

import logging

logger = logging.getLogger('curve')

@require_http_methods(['POST'])
def register(request):
    """
    Register a new member.
    """
    fullname = checkNull(request.POST['fullname'])
    email = checkNull(request.POST['email'])
    password = checkNull(request.POST['password'])

    for name, value in { 'Name': fullname, 'Email': email, 'Password': password }.items():
        if not value:
            request.session['error'] = name + ' can NOT be empty.'
            return redirect('/')
        pass

    user = User.objects.filter(username=fullname).filter(email=email)
    if user:
        logger.debug('user %s already exists.', fullname)
        request.session['error'] = 'User name or email already taken.'
    else:
        # create user.
        user = User.objects.create_user(fullname, email, password)
        user.save()
        logger.debug('user: %s created.', fullname)
        # create member.
        member = Member.objects.create(user=user, username=fullname)
        member.save()
        logger.debug('member: %s created.', member.id)

        user = authenticate(username=fullname, password=password)
        if user is not None:
            login(request, user)
    return redirect('/')

def checkNull(str):
    return str is None or str.strip()




