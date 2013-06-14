# from datetime import datetime
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils import simplejson
from django.views.decorators.http import require_http_methods

from connection.models import Session

import logging

logger = logging.getLogger('curve')

@login_required
@require_http_methods(['POST'])
def connect(request):
    """
    Connect to connection manager.
    """
    result = Session.manager.connect(request)
    return HttpResponse(simplejson.dumps(result))
