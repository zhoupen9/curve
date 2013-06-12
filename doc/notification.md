Notification
=====

Notification service provides dynmatic content delivery facilities,
it provides interfaces that client can listen on or publish notifications.

Notifications delivery depends on underlying connection manager directly,
Notification service send notifications to connection manager by direct calls.

Notify example:
	```python
    from notification import Notification
    notify = new Notification();
    Notification.manager.add(notify);
    ```
Noticification service delivery:
	```python
    from connection import Session

    def add(self, notification):

    	# save notification
    	self.manager.save(notification)

    	to = notification.to;
    	session = Session.manager.get(to)

    	if sessoin is not None:
    		# target is online.
    		session.send(notification.serialized())
    ```

