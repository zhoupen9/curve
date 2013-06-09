from datetime import datetime
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils import simplejson
from manager import Connection

import logging

logger = logging.getLogger('curve')

@login_required
def poll(request):
    """
    Try to poll data from server.
    If there's no data ready to delivery, this method will block.
    """
    result = {}
    user = request.session['userid']
    if user is None:
        result['success'] = False
    else:
        connection = Connection.manager.get(user)
        connection.poll()
        result['sucess'] = True
    return HttpResponse(simplejson.dumps(result))

@login_required
def recv(request):
    """
    Receive data from connection.
    """
    result = {}
    user = request.session['userid']
    if user is None:
        result['success'] = False
    else:
        connection = Connection.manager.get(user)
        data = connection.recv()
        logger.debug('user %s received data: %s', user, str(data))
        result['success'] = True
        result['data'] = str(data)
    return HttpResponse(simplejson.dumps(result))
                            
def notify(request):
    """
    Notify user, data already arrived and ready to receive.
    """
    user = request.session['userid']
    result = {}
    connection = Connection.manager.get(user)
    if connection is not None:
        data = {}
        data['success'] = True
        data['time'] = datetime.now()
        connection.send(data)
        result['success'] = True
    else:
        result['success'] = False

    return HttpResponse(simplejson.dumps(result))
