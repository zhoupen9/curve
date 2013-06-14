"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TransactionTestCase
from member.models import Member
from notification.models import Notification

class NotificationTest(TransactionTestCase):
    def testAddNotification(self):
        """
        Tests add notification
        """
        member = Member.objects.create_member('z1', 'z1@example.com', 's3cr3t')
        sender = member.user
        target = member.user
        notification = Notification.objects.create(sender, target, 'post', 'new post')
        Notification.objects.add(notification)
