from django.db import models
from django.contrib.auth.models import User, Group
import logging

logger = logging.getLogger('curve')

class MemberManager(models.Manager):
    """
    Member models default manager.
    It provides convenient methods for manipulating members.
    """
    def check_user_and_email(self, fullname, email):
        """
        Check if username or email already exists.
        """
        users = User.objects.filter(username=fullname).filter(email=email)
        if users.exists():
            logger.debug("user with name: " + fullname + " already exists, id: " + users[0].id)
        return not users.exists()

    def create_member(self, fullname, email, password):
        """
        Create a new member.
        Because curve uses django's auth module, a django user need be created first.
        """
        user = User.objects.create_user(fullname, email, password)
        if user is not None:
            logger.debug('user: %s created.', fullname)

        new_member = Member(user=user, username=fullname)
        new_member.save()

        logger.debug('member: %s created.', new_member.id)
        return new_member

    def get_member(self, userid):
        """ Get member by id. """
        return super(MemberManager, self).get_query_set().get(user_id=userid)

    def get_lists_of_member(self, member):
        """ Get member's lists. """
        return super(models.Manage, self).get_query_set().filter(member_id=member)

class Member(models.Model):
    """
    Curve members are registered users who can access fucilities.
    """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, unique=True)
    username = models.CharField(max_length=128, unique=True)
    department = models.CharField(max_length=128, null=True)
    title = models.CharField(max_length=64, null=True)
    description = models.CharField(max_length=1024, null=True)
    photo = models.CharField(max_length=256, null=True)
    objects = MemberManager()

class MemberGroup(models.Model):
    """
    Meber groups contains groups of member.
    Group and its members are in a many-to-many relationship.
    This model use django's auth model group.
    """
    id = models.AutoField(primary_key=True)
    members = models.ManyToManyField(Member, through="MemberShip")
    group = models.ForeignKey(Group)
    name = models.CharField(max_length=128, unique=True)
    description = models.CharField(max_length=1024)

class MemberShip(models.Model):
    """
    Member's membership.
    Each member can have multi-memberships.
    """
    id = models.AutoField(primary_key=True)
    member = models.ForeignKey(Member)
    group = models.ForeignKey(MemberGroup)
    date_joined = models.DateField()

class Profile(models.Model):
    """
    Member's individual profile.
    Each member has an unique profile.
    """
    id = models.AutoField(primary_key=True)
    owner = models.OneToOneField(Member, unique=True)

class MemberList(models.Model):
    """
    Member list contains multi-members.
    Member lists are created by member and can add members into it.
    Other members can reference to created lists and they can also
    subscrible to member lists. Any activities occurred, all member
    lists which contains owners of activies will be notified.
    """
    id = models.AutoField(primary_key=True)
    profile = models.ForeignKey(Profile)
    members = models.ManyToManyField(Member, related_name="memberof+", through="ListMembers")
    subscribers = models.ManyToManyField(Member, related_name="subscriberof+", through="ListSubscribes")

class ListMembers(models.Model):
    """
    List members.
    """
    id = models.AutoField(primary_key=True)
    member_list = models.ForeignKey(MemberList)
    member = models.ForeignKey(Member)
    date_added = models.DateField()
    class Meta:
        ordering = ['date_added']

class ListSubscribes(models.Model):
    """
    List subscribers.
    """
    id = models.AutoField(primary_key=True)
    member_lsit = models.ForeignKey(MemberList)
    subscriber = models.ForeignKey(Member)
    date_subscribed = models.DateField()
    class Meta:
        ordering = ['date_subscribed']
