# Create your views here.

from datetime import datetime
from django.contrib.auth.decorators import login_required
# from django.http import HttpResponse
from django.shortcuts import render
from member.models import Member
from models import Document
import logging

logger = logging.getLogger('curve')

@login_required
def recent(request):
    """ Get member's recent documents. """
    userid = request.session['userid']
    member = Member.objects.get(user_id=userid)
    context = {}
    context['documents'] = createDummyDocument(member, 5)
    context['ajax'] = request.is_ajax()
    return render(request, 'document/recent.html', context)

def createDummyDocument(member, count):
    """ Create dummy documents created by member. """
    documents = []
    for index in range(count):
        # document = Document.objects.create(member, 'Sample document ' + str(index), 'This is a sample document generated by server.')
        document = Document(id=1, member=member, title='Sample document ' + str(index), content='This is a sample document generated by server.', createTime=datetime.now())
        documents.append(document)
        pass
    return documents
