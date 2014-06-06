from notification.models import Notification
from importlib import import_module
import notification.settings

DELIVERY_CLASS_FULL = settings.DELIVERY
DELIVERY_PACKAGE = '.'.join(DELIVERY_CLASS_FULL.split('.')[:-1])
DELIVERY_CLASSNAME = ''.join(DELIVERY_CLASS_FULL.split('.')[-1:])

# import manager module.
module = import_module(DELIVERY_PACKAGE)

# create notification application's default delivery.
# print 'trying to import lib:%s.' % DELIVERY_PACKAGE
delivery = getattr(module, DELIVERY_CLASSNAME)()

Notification.objects.setDelivery(delivery)
