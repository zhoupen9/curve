from django.db import models
from django.contrib.auth.models import User, Group

from curve.utils import checkEmpty
# Create your models here.

class MemberGroup(models.Model):
    """ Meber groups are groups of member. """
    id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group)
    name = models.CharField(max_length=128, unique=True)
    description = models.CharField(max_length=1024)

class Member(models.Model):
    """ Curve members are registered user who can access fucilities. """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, unique=True)

    """ member-group many-to-one relationship. """
    username = models.CharField(max_length=128, unique=True)
    group = models.ForeignKey(MemberGroup, null=True)
    department = models.CharField(max_length=128, null=True)
    title = models.CharField(max_length=64, null=True)
    description = models.CharField(max_length=1024, null=True)
    photo = models.CharField(max_length=256, null=True)

class Profile(models.Model):
    """ Member's individual profile. """
    id = models.AutoField(primary_key=True)
    member = models.OneToOneField(Member, unique=True)
    
def usernameExists(username):
    """ Check if username is already registered. """
    member = Member.objects.filter(username=username)
    return member is None

def emailExists(email):
    """ Check if email is already registered. """
    member = Member.objects.filter(email=email)
    return member is None
        
def register(username, email, password):
    """ Register a member of Curve. """
    checkEmpty(username)
    checkEmpty(email)
    checkEmpty(password)
    if usernameExists(username):
        return False, username + " already registered."
    if emailExists(email):
        return False, email + " already registered."
    user = User.objects.create_user(username, email, password)
    member = Member.objects.create(username=username, email=email, password=password, user=user)
    member.save()
    return True, ""

