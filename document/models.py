from django.db import models
from member.models import Member
from datetime import datetime

# Create your models here.
DEFAULT_DOCUMENT_LIMIT = 10

class DocumentManager(models.Manager):
    """ Document manager. """
    def create(self, member, title, content):
        """ Create a new document article. """
        document = Document(member=member, title=title, content=content, createTime=datetime.now())
        document.save()
        return document

    def recent(self, userid, limit=DEFAULT_DOCUMENT_LIMIT):
        """ Get member's recent document with limited count. """
        querySet = super(DocumentManager, self).get_query_set().filter(member__user__id=userid)
        return querySet[:limit], querySet.count() - limit
    pass

class Document(models.Model):
    id = models.AutoField(primary_key=True)
    member = models.ForeignKey(Member)
    title = models.CharField(max_length=255)
    content = models.TextField()
    createTime = models.DateTimeField()
    objects = DocumentManager()

    class Meta:
        ordering = ['createTime']
