# from datetime import datetime
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils import simplejson
from django.views.decorators.http import require_http_methods

from connection import manager

import logging

logger = logging.getLogger('curve')

@login_required
@require_http_methods(['POST'])
def connect(request):
    """
    Create BOSH session request.
    """
    result = {}
    user = request.session['userid']

    rs = manager.createSession(user, request.POST)
    result['response'] = rs.response

    return HttpResponse(simplejson.dumps(result))

@login_required
@require_http_methods(['POST'])
def request(request):
    user = request.session['userid']
    connection = manager.recv(user, request.POST)
    result = connection.poll()
    return HttpResponse(simplejson.dumps(result))
