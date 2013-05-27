
from member.models import Member
from django.db import models

# Create your models here.

class Tag(models.Model):
    """
    Post tags.
    Posts and tags' relationship is a many-to-many relationship,
    Since django models creates backward reference, we only create
    that many-to-many relationship on the other end.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=32, unique=True)
    
class Post(models.Model):
    """
    Post.
    """
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=256)
    tag = models.ManyToManyField(Tag)
    createTime = models.DateTimeField()
    member = models.ForeignKey(Member)
    content = models.TextField()
