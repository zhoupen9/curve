
from importlib import import_module
import settings

MANAGER_CLASS_FULL = settings.CONNECTION_MANAGER
MANAGER_PACKAGE = '.'.join(MANAGER_CLASS_FULL.split('.')[:-1])
MANAGER_CLASSNAME = ''.join(MANAGER_CLASS_FULL.split('.')[-1:])

# import manager module.
module = import_module(MANAGER_PACKAGE)
# create connection's default manager.
manager = getattr(module, MANAGER_CLASSNAME)()
