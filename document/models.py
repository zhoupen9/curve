from django.db import models
from member.models import Member

# Create your models here.
DEFAULT_BLOG_LIMIT = 10

class BlogManager(models.Manager):
    """ Blog maanger. """
    def create(self, member, title, content):
        """ Create a new blog article. """
        blog = Blog(member=member, title=title, content=content)
        blog.save()
        return blog

    def recent(self, member, limit=DEFAULT_BLOG_LIMIT):
        """ Get member's recent blog with limited count. """
        return super(BlogManager, self).get_query_set().filter(member=member)[:limit]
    pass

class Blog(models.Model):
    id = models.AutoField(primary_key=True)
    member = models.ForeignKey(Member)
    title = models.CharField(max_length=255)
    content = models.TextField()
    createTime = models.DateTimeField()
    objects = BlogManager()

    class Meta:
        ordering = ['createTime']
