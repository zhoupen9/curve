
from django.utils import simplejson
from notification.models import Notification, Delivery
from datetime import datetime
from session import Session
from manager import Manager
from settings import SESSION

import threading
import logging

logger = logging.getLogger('curve')

class Schema(object):
    """
    BOSH scheme was documented as an xml scheme in XEP-0124:
    http://www.xmpp.org/extensions/xep-0124.html
    """
    attributes = {
	'accept': str,
	'ack': int, # positive integer
	'authid': str,
	'charsets': str, # xs:NMTOKENS
	'condition': ( # xs:NCName
	    'bad-request',
	    'host-gone',
	    'host-unkonwn',
	    'improper-addressing',
	    'internal-server-error',
	    'item-not-found',
	    'other-request',
	    'policy-violation',
	    'remote-connection-failed',
	    'remote-stream-error',
	    'see-other-uri',
	    'system-shutdown',
	    'undefined-condition',
	    ),
	'content': str,
	'from': str,
	'hold': int, # unsigned byte
	'inactivity': int, # unsigned short
	'key': str,
	'maxpause': int, # unsigned short
	'newkey': str,
	'pause': int, # unsigned short
	'polling': int, # unsigned short
	'report': int, # positive integer
	'requests': int, # unsigned byte
	'rid': int, # positive integer
	'route': str,
	'sid': str,
	'stream': str,
	'time': int, # unsigned short
	'to': str,
	'type': ( # xs:NCName
	    'error',
	    'terminate',
	    ),
	'ver': str,
	'wait': int, # unsigned short
	'lang': str, # xml:lang
	}

    def check(self):
	""" Check if instance conform to its schema. """
	if not hasattr(self, 'schema'):
	    raise TypeError('schema not found.')

	if self.schema is None:
	    raise ValueError('schema is None.')

	for name in self.schema:
	    if name not in self.attributes:
		raise ValueError('invalid schema.')
	    value = self.schema[name]
	    if value is None:
		raise ValueError('schema item:' + name + ' has no value.')
	    checkType = self.attributes[name]
	    checkType = type(checkType) == 'type' or 'string'
	    if type(value) != checkType:
		raise TypeError('schema item: ' + name + ' has invalid value type.')
	    pass
	pass
    pass

class Terminate(Schema):
    """ Server terminate session. """
    schema = [
	'type',
	'condition', # optional
	]

    def create(self, condition=None):
	""" Create server terminate response. """
	response = {
	    'type': 'terminate'
	    }
	if condition is not None:
	    response['condition'] = condition
	return response
    pass

class ConnectResponse(object):
    schema = [
	'sid',
	'wait',
	'ver',
	'polling',
	'inactivity',
	'requests',
	'hold',
	'to'
	]

    def create(self, sid, rid, to):
	response = {
	    'sid': sid,
	    'rid': rid,
	    'to': to,
	    }
	return response
    pass

class Handler(object):
    """ Abstract data handler. """
    def handle(self, data):
	raise NotImplementedError()
    pass
pass

# session status.
SessionStatus = {
    'created': 0,
    'connection': 1,
    'connected': 2,
    'disconnected': 3,
    }

class Connection(object):
    """
    Virtual connection.
    This connection is an abstraction above HTTP connection.
    """
    def __init__(self, wait=None, timeout=None):
        self.wait = wait
        if timeout is not None and  not callable(timeout):
            raise TypeError('timeout callback is not callable.')
        
        self.timeout = timeout
	self.event = threading.Event()
        self.event.clear()
	pass

    def send(self, data):
        """
        Send data on this connection.
        If client has already wait on this connection, notify it.
        """
        self.pending = data
        self.notify()

    def poll(self):
	"""
	Try poll data from connection.
	Call this method will simply block until there's data to transfer
	and event was set.
	"""
        if self.wait is not None:
            done = self.event.wait(self.wait)
        else:
            done = True
        
        if not done:
            # timeout
            timeout = getattr(self, 'timeout')
            if timeout is not None and callable(timeout):
                return timeout()
            else:
                return {}
            pass
        else:
           return self.pending 
	pass

    def notify(self):
        """ Notify client waiting on this connection that there's data to receive. """
	self.event.set()
	pass
    pass

class ClosedConnection(Connection):
    """ Closed connection. """
    def poll(self):
	"""
	Poll on closed connection will result a terminate response.
	"""
	terminate = Terminate().create('bad-request')
	return terminate
    pass

class BoshSession(Session):
    """
    BOSH session implementation.
    """
    hold = [] # holding connections.
    options = {} # session options
    pending = [] # queued data pending to send. 

    def __init__(self, options):
	if options is None:
	    raise TypeError('options is None.')
	try:
	    for option in options:
		self.options[option] = options[option]
		pass
	    pass
	except:
	    raise TypeError('options is invalid.')
	pass

    def create(self, sid, rid, to):
	"""
	Create session and return response.
	"""
        self.sid = sid
        self.rid = rid
        self.to = to
	self.status = SessionStatus['connected']
	response = {
	    'sid': sid,
	    'rid': rid,
	    'to': to,
	    'ver': self.options['ver'],
	    'lang': self.options['lang'],
	    'wait': self.options['wait'],
	    'hold': self.options['hold'],
	    'inactivity': self.options['inactivity'],
	    'polling': self.options['polling'],
	    }
	return response

    def send(self, data):
	"""
	Try to send data in session.
	If there's no active command connection, server will close session.
	"""
	# send response on command connection and wait a data connection
	# to poll data.
	try:
	    if len(self.hold) < 1:
		logger.debug("There's no connection hold, pending...")
                self.pending.append(data)
            else:
                connection = self.hold.pop()
                connection.send(data)
	except RuntimeError:
	    self.close()
	pass

    def recv(self, data):
	"""
	Try to receive data from BOSH session.
	If there's no active connection in sessoin, server will close session.
	"""
	try:
	    # receive.
	    connection = self.hold.pop()
	    connection.notify()
	except RuntimeError:
	    logger.debug('no active data connection, server may hold this connection.')
	    pass

        if len(self.pending) > 0:
            # If there's data pending to send, sent it immediately.
            connection = Connection()
            connection.send(self.pending.pop())
        else:
            if len(self.hold) >= self.options.hold:
                # Cant hold any connections.
                self.close('policy-violation')
                return ClosedConnection()
            else:
                # hold this connection.
                connection = Connection(self.options.wait, self.timeout)
                self.hold.append(connection)
                pass
            pass
	return connection

    def close(self, condition=None):
	""" Close BOSH session. """
	super(BoshSession, self).close()

	self.status = SessionStatus['disconnected']
	connection = self.hold.pop()
	if connection is not None:
	    terminate = Terminate()
	    connection.send(terminate.create(condition))
            pass
        pass

    def timeout(self):
        """
        When session timeouted, response an empty response to client.
        """
        return {}
    
    pass

class BoshDelivery(Delivery):
    """ Bosh delivery employee BOSH to send given data. """
    def delivery(self, data):
	""" Delivery data. """
	target = getattr(data, 'target', None)
	if target is None:
	    logger.debug('Delivery has no target, dicard.')
	    pass
	session = BoshSession.manager.get(target)
	if session is not None:
	    # target is online
	    session.send(data)
	pass
    pass

class BoshManager(Manager):
    """
    BOSH connection manager.
    This class implement XMPP Bidirectional-streams Over Synchronous HTTP (BOSH),
    which was defined in XEP-0124, http://xmpp.org/extensions/xep-0124.html
    """
    sessions = {}
    options = {}
    handlers = []

    def __init__(self, options):
	""" Initialize BOSH connection manager. """
	for option in options:
            self.options[option] = options[option]
            pass
	pass

    def createSid(self, userid):
	""" Create session id. """
	return 'sid-' + str(userid)

    def success(self, data=None):
	result = {}
	if data:
	    result['data'] = data
	return simplejson.dumps(result)

    def createSession(self, userid, request):
	"""
	Create a bosh session.
	Connection manager SHOULD response to request.
	"""
	if request is None:
	    raise ValueError('connection can not be none.')

	if userid in self.sessions:
	    logger.debug('a session bind with %d already exists.', userid)
	    # terminate existed session.
	    session = self.sessions[userid]
	    session.close('other-request')
	    self.terminateSession(session, 'other-request')
	    pass

	session = BoshSession(self.options)
	# response to request.
	return session.create(self.createSid(userid), request['rid'], request['to'])

    def terminateSession(self, session, condition=None):
	""" Terminate session. """
	response = Terminate()
	response.type = 'terminate'
	if condition is not None:
	    response.condition = condition
	    pass
	session.send(response)
	del self.sessions[session.sid]
	pass

    def recv(self, userid, data):
	"""
	Receive data from client's poll request.
	"""
	for handler in self.handlers:
	    match = handler.regex.match(data.to)
	    if match is not None:
		handler.handle(userid, data)
		pass
	    pass

	sid = data.sid
	session = self.sessions[sid]
	if session is None:
	    logger.debug('Session not found, sid: %s.', sid)
	    connection = ClosedConnection()
	    pass
	else:
	    connection = session.recv(data)
	    pass
	return connection
    pass


# Bosh session's default manager.
BoshSession.manager = BoshManager(SESSION)
# register delivery to notification service.
Notification.objects.setDelivery(BoshDelivery())
