from datetime import datetime, timedelta
from Queue import Queue as Pending, Empty
from threading import Timer

from notification.models import Delivery
from models import Session, Manager, Handler

import logging
import settings

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

class Connect(object):
    """
    BOSH session initial request.
    """
    schema = [
        'rid',
        'to',
        'wait',
        'ver',
        'hold',
        'lang',
        'charsets',
        ]

    def create(self, post):
        request = {}
        for key in self.schema:
            if key not in post:
                raise KeyError(key + ' not found in request.')
            else:
                request[key] = post[key]                
            pass        
        pass
    pass

class ConnectResponse(object):
    """
    BOSH session initial request response.
    """
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

# session status.
SessionStatus = {
    'created': 0,
    'connection': 1,
    'connected': 2,
    'disconnected': 3,
    }

class BoshHandler(Handler):
    """
    Abstract BOSH session data handler.
    Classes extends this class must implementst handle interface,
    which is responsible for processing data transfered in BOSH session.
    Data passed in is an impact HTTP request.
    """
    def __init__(self, regex):
        if regex is None or type(regex) != str:
            raise ValueError('given regular expression is invalid.')
        self.regex = regex # regular expression for matching BOSH session's destionation.
        pass

    def handle(self, request):
        """
        Handle BOSH session's HTTP request, it comes from client's poll request.
        """
        raise NotImplementedError()

class BoshManager(Manager):
    """
    BOSH connection manager.
    This class implement XMPP Bidirectional-streams Over Synchronous HTTP (BOSH),
    which was defined in XEP-0124, http://xmpp.org/extensions/xep-0124.html
    """
    def connect(self, request):
        """
        BOSH connection manager connect implementation.

        If request contains session id, key 'sid' in request.POST, the rquest is intented
        to initizlied session, otherwise the request is a data transition.
    
        If request contains data which client sent to server, connection manager should handle it.
        And connection manager would not resposne to this request until there's data to send to
        client (recommended in BOSH).
        """
        
        user = request.session['userid']
        if 'sid' not in request.POST:
            # request to initialize session
            logger.debug('request create session, userid: %s, rid: %s, to: %s', \
                             user, request.POST['rid'], request.POST['to'])
            result = super(BoshManager, self).accept(user, request.POST)
        else:
            sid = request.POST['sid']
            logger.debug('new request, sid: %s, rid: %s.', sid, request.POST['rid'])
            try:
                session = super(BoshManager, self).get(sid)
                result = session.recv(request.POST)
            except KeyError:
                result = Terminate().create('item-not-found')
                pass
            pass
        return result

    def getByOwnerId(self, userid):
        """ Get session by owner name. """
        for sid in self.sessions:
            if sid.startswith('sid-' + userid + '-'):
                return self.sessions[sid]
            pass
        return None

    def createSession(self, sid, request):
	"""
	Create a bosh session.
	Connection manager SHOULD response to request.
	"""
	if request is None:
	    raise ValueError('connection can not be none.')

        try:
            connect = Connect().create(request)
            session = BoshSession(sid)
            return session, session.create(sid, connect)
        except KeyError:
            return None, Terminate().create('bad-request')
    pass

class BoshSession(Session):
    """
    BOSH session implementation.
    """
    manager = BoshManager()
    
    def __init__(self, sid, options=settings.SESSION_OPTIONS):
	if sid is None or not sid.strip() or options is None:
	    raise ValueError('parameter is invalid.')

        self.options = {}
        # copy options.
        for option in options:
            self.options[option] = options[option]
            pass
        
        self.sid = sid
        self.hold = [] # holding connections.
        self.options = {} # session options
        self.lastpoll = None # last poll timestamp
        self.lastrid = None # last rid.
        self.last = None # last data sent.
        self.inactive = None # most recent inactive timestamp.
        self.pending = Pending() # pending data queue, they will be pushed to client in a future request.
	pass

    def pollInternal(self):
        """
        Perform poll.
        If wait is not None and there's no data queued, caller will block in a duration
        of wait time (in seconds). Once poll returned, another unblocking fetching will
        be performed to check if more data queued, if so fetch rest of queued data as well.
        """
        pendings = []
        wait = self.options['wait']
        if wait is not None:
            logger.debug('try to poll on holding connect may block in %d seconds.', wait)
            try:
                data = self.pending.get(True, wait) # get queued data with block.
                pendings.append(data)
            except Empty:
                # timeout
                logger.debug('poll timeout in %d seconds.', wait)
                return self.timeout()
            pass
        
        # got head of queue, check rest of queue without blocking.
        while True:
            try:
                data = self.pending.get(False) # get queued data without block.
                pendings.append(data)
                pass
            except Empty:
                break
            finally:
                self.pending.task_done()
                pass
            pass
        # return joined queued data
        return pendings
    
    def createInternal(self, sid, connect):
	"""
	Create session and return response.
	"""
        self.sid = sid
        self.rid = connect['rid']
        self.to = connect['to']
	self.status = SessionStatus['connected']
	response = {
	    'sid': self.sid,
	    'rid': self.rid,
	    'to': self.to,
	    'ver': self.options['ver'],
	    'lang': self.options['lang'],
	    'wait': self.options['wait'],
	    'hold': self.options['hold'],
	    'inactivity': self.options['inactivity'],
	    'polling': self.options['polling'],
	    }
        # set create time as first poll time, to prevent client connected and hang it.
        self.lastpoll = datetime.now()
        self.scheduleInactivityCheck()
	return response

    def scheduleInactivityCheck(self):
        """ 
        Start a timer to check if session's inactivity.
        Timer will timeout in a duration which is set in options.
        """
        Timer(self.options.inactivity, self.checkInactivity, ()).start()
        pass

    def checkInactivity(self):
        """
        Check session's inactivity.
        """
        now = datetime.now()
        if now > self.lastpoll + timedelta(self.options.inactivity) and len(self.hold) < 1:
            # Connection manager SHOULD assume client disconnected.
            self.manager.disconnected(self)
        pass
    
    def send(self, data):
	"""
	Try to send data in session.
        This method simply put data in queue, if there's any connections holding,
        the head of those hold conntions will unblock.
	"""
        self.pending.put(data)
	pass

    def recv(self, request):
	"""
	Try poll data from connection.
        Session will trial data from request first.
        And then push queued data back to request if present, otherwise hold this connection
        until there's data ready to push to client or encountered a timeout (meaning there's 
        no data in the duration of wait time.

        This implementation will return a json serializable object.
	"""
        try:
            rid = request['rid']
        except KeyError:
            logger.debug('rid not found in request.')
            # Server will close session caused by bad request.
            self.close('bad-request')
            pass

        if self.lastpoll is not None and datetime.now() < self.lastpoll + timedelta(seconds=self.options.polling):
            # polling to frequently, overactivity.
            self.close('policy-volation')
            pass

        self.lastpoll = datetime.now()
        # trial data from request
        if 'data' in request:
            self.manager.recv(request['data'])

        if rid == self.lastrid:
            # request was resent by client on broken connection.
            # server SHOULD send last HTTP 200 and queued data, see XEP-1024 broken connection.
            return self.last
        elif rid < self.lastrid:
            self.close('bad-request')

        if len(self.hold) >= self.options['hold']:
            # Cant hold any connections.
            self.close('policy-violation')
            pass

        # poll pending data.
        polled = self.pollInternal()
        logger.debug('poll done, got:%s.', str(polled))

        # save last rid and last data, in case of broken connection.
        self.lastrid = rid
        self.last = polled

        if len(self.hold) < 1:
            # if no connection holds, schedule an inactivity check.
            self.scheduleInactivityCheck()
            pass
        return polled
    
    def closeInternal(self, condition=None):
	""" Close BOSH session. """
	self.status = SessionStatus['disconnected']
        try:
            connection = self.hold.pop()
            terminate = Terminate().create(condition)
	    connection.send(terminate)
            # When close session, all holding connection should be closed gracefully.
            while not self.hold.empty():
                try:
                    self.hold.pop().send(terminate)
                except:
                    logger.debug('no more connection held.')
                    break
                pass
            pass
        except:
            logger.debug('no connection held.')
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
	    logger.debug('Delivery has no target, discard.')
	    return
	session = BoshSession.manager.getByOwnerId(target.user.id)
	if session is not None:
	    # target is online
	    session.send(data)
	pass
    pass
