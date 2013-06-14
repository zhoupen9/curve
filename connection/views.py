# from datetime import datetime
from django.http import HttpResponse, HttpResponseForbidden
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
    user = request.session['userid']
    logger.debug('request create session, userid: %s, rid: %s, to: %s', \
                     user, request.POST['rid'], request.POST['to'])
    result = manager.accept(user, request.POST)
    return HttpResponse(simplejson.dumps(result))

@login_required
@require_http_methods(['POST'])
def request(request):
    """
    Create request in BOSH session.
    If request contains data which client sent to server, connection manager should handle it.
    And connection manager would not resposne to this request until there's data to send to
    client (recommended in BOSH).
    """
    user = request.session['userid']
    try:
        sid = request.POST['sid']
    except KeyError:
        return HttpResponseForbidden()
    logger.debug('send request, sid: %s, rid: %s.', sid, request.POST['rid'])
    connection = manager.recv(user, request.POST)
    # if there's no data queue to send, poll will block.
    result = connection.poll()
    return HttpResponse(simplejson.dumps(result))
