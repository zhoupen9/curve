
from models import Session
from importlib import import_module

import settings

SESSION_CLASS_FULL = settings.SESSION
SESSION_PACKAGE = '.'.join(SESSION_CLASS_FULL.split('.')[:-1])
SESSION_CLASSNAME = ''.join(SESSION_CLASS_FULL.split('.')[-1:])

# import manager module.
module = import_module(SESSION_PACKAGE)

# create session's default manager.
Session.manager = getattr(module, SESSION_CLASSNAME).manager
