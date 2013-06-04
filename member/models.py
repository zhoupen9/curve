from django.db import models
from django.contrib.auth.models import User, Group
import logging

logger = logging.getLogger('curve')

# Create your models here.

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

class MemberManager(models.Manager):
    """
    Member models default manager.
    It provides convenient methods for manipulating members.
    """
    def create_member(self, user, fullname):
	new_member = Member(user=user, fullname=fullname)
	new_member.save()

	logger.debug('member: %s created.', new_member.id)
	return new_member

    def get_lists_of_member(self, member):
        return super(models.Manage, self).get_query_set().filter(member_id=member)
