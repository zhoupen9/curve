from django.db import models
from django.contrib.auth import User

# Create your models here.
NotificationStatus = ['unread', 'read']

class Delivery(object):
    """ Abstract notification delivery."""
    def devliery(self, data):
        raise NotImplementedError()
    
class NotificationManager(models.Manager):
    """ Notification manager. """
    def getNotifications(self, userid):
        """ Get user's notifications. """
        return super(NotificationManager, self).get_query_set().filter(user=userid).filter(status='unread')

    def markAsRead(self, notification):
        """ mark notification as read. """
        notification.status = 'read'
        notification.save()
        pass

    def addNotification(self, notification):
        """ Add a new notification. """
        notification.save()
        self.delivery.delivery(notification)
        pass

    def setDevliery(self, delivery):
        """ set notification delivery. """
        if delivery is None:
            raise ValueError('devliery can not be none.')
        self.devliery = delivery
    pass

class Notification(models.Model):
    """ Notification. """
    id = models.AutoField(primary_key=True)
    user = models.ForiegnKey(User)
    type = models.CharField(max_length=32)
    content = models.TextField()
    createTime = models.DateField()
    sender = models.ForiegnKey(User, related_name="sender")
    objects = NotificationManager()
    
