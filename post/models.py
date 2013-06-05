
from datetime import datetime
from member.models import Member, MemberList
from django.db import models

import logging

logger = logging.getLogger('curve')

# Create your models here.

DEFAULT_POST_LIMIT = 10

class PostManager(models.Manager):
    """
    Post manager.
    """
    def get_posts_by_tag(self, tag, limit=DEFAULT_POST_LIMIT):
        """
        Get posts which contains tag with a count limit.
        If limit parameter is not provided, this method will return default limited count.
        """
        return super(PostManager, self).get_query_set().filter(tags__contains=tag).limit(limit)

    def get_posts_by_author(self, author, limit=DEFAULT_POST_LIMIT):
        """
        Get posts which has an author is exectly the given author.
        If limit parameter is not provided, this method will return default limited count.
        """
        return super(PostManager, self).get_query_set().filter(member=author).limit(limit)

    def get_posts_mentioned(self, member, limit=DEFAULT_POST_LIMIT):
        """
        Get posts which mentioned given member.
        If limit parameter is not provided, this method will return default limited count.
        """
        return super(PostManager, self).get_query_set().filter(mention_ats__contains=member)

    def create_post(self, author, title, content, create_time=datetime.now()):
        """
        Create a new post.
        This method checks if all tags provided exist, if not so create them.
        and also check if members or lists mentioned in the content.
        """
        post = Post(member=author, title=title, content=content, createTime=create_time)
        # TODO setup mentions.
        post.save()
        return post
        
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
    A single post may mention member(s).
    Mentions are referenced by '@' followed by a single member name.
    It may appears in posts, conversation or conferences.
    A post may also mention list(s).
    Posts may mention topic(s).
    """
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=256)
    tags = models.ManyToManyField(Tag)
    createTime = models.DateTimeField()
    member = models.ForeignKey(Member)
    content = models.TextField()
    mention_ats = models.ManyToManyField(Member, related_name="mentioned+", through="Mention")
    mention_lists = models.ManyToManyField(MemberList, through="ListMention")
    objects = PostManager()
    
    class Meta:
        """ Post meta. Provides default ordering by create time."""
        ordering = ['createTime']

class Mention(models.Model):
    """
    Post mentions.
    """
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey(Post)
    member = models.ForeignKey(Member)
    date_mentioned = models.DateField()
    class Meta:
        ordering = ['date_mentioned']

class ListMention(models.Model):
    """
    Post mentioned list.
    """
    id = models.AutoField(primary_key=True)
    psot = models.ForeignKey(Post)
    member_list = models.ForeignKey(MemberList)
    date_mentioned = models.DateField()
    class Meta:
        ordering = ['date_mentioned']
    
