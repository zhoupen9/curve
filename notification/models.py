from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

# Create your models here.
NotificationStatus = {
    'unread': 0,
    'read': 1,
}

class Delivery(object):
    """ 
    Abstract notification delivery.
    Classes extend this class is responsbile to delivery notification to its destination.
    If the notification's destination is not local, then implementation need to support
    remote deliveries.
    If application runs in a distributed network, implementation also need to support
    delivery notifications to other nodes.
    """
    def devliery(self, data):
        raise NotImplementedError()
    
class NotificationManager(models.Manager):
    """ Notification manager. """
    def getNotifications(self, userid):
        """ Get user's notifications. """
        return super(NotificationManager, self).get_query_set().filter(user=userid).filter(status=NotificationStatus['unread'])

    def markAsRead(self, notification):
        """ mark notification as read. """
        notification.status = 'read'
        notification.save()
        pass

    def add(self, notification):
        """ Add a new notification. """
        assert notification.status == NotificationStatus['unread']
        notification.save()
        self.delivery.delivery(notification)
        pass

    def create(self, sender, user, type, content):
        """ Create a new notification. """
        notification = Notification(user=user, type=type, content=content, createTime=datetime.now(), status=NotificationStatus['unread'], sender=sender)
        return notification

    def setDelivery(self, delivery):
        """ set notification delivery. """
        if delivery is None:
            raise ValueError('devliery can not be none.')
        self.delivery = delivery
    pass

class Notification(models.Model):
    """ Notification. """
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User)
    type = models.CharField(max_length=32)
    content = models.TextField()
    createTime = models.DateField()
    sender = models.ForeignKey(User, related_name="sender")
    status = models.IntegerField()
    objects = NotificationManager()

