import logging
import settings

logger = logging.getLogger('curve')

OPEN = 1
CLOSED = 2

SESSION_STATUS = (OPEN, CLOSED)

def getInternalRequest(request, method):
    """ Get internal request. """
    if request is None or method is None:
        raise ValueError('request and method can not be None.')
    if not hasattr(request, method):
        raise TypeError('request has no attribute: '+ method)

    return getattr(request, method)

class Session(object):
    """
    Abstract session.
    A session is a connection orient abstraction.
    Subclasses of this class must implement send() and recv().
    """
    def create(self, sid, request, method='POST'):
        """
        Create session.
        sid is session id.
        request is a HTTP request.
        """
        self.sid = sid
        self.status = OPEN
        return self.createInternal(getInternalRequest(request, method))

    def close(self, condition=None):
        """
        Close session.
        """
        self.status = CLOSED
        return self.closeInternal(condition)

    def createInternal(self, sid, request):
        """
        Internal creation implementation.
        """
        raise NotImplementedError()

    def closeInternal(self, condition=None):
        """
        Internal close session.
        """
        raise NotImplementedError()

    def send(self, data):
        """
        Send data within session.
        """
        raise NotImplementedError()

    def recv(self, data):
        """
        Receive data from session.
        """
        raise NotImplementedError()

class Handler(object):
    """ 
    Abstract data handler. 
    Classes extends this class must implement handle interface,
    which is responsible for processing data transafered within a session.
    Data passes in could be a raw socket when session implemented by
    WebSocket, it also could be a HTTP request when session implemented 
    by so-called 'long-poll' technologies such as BOSH, Comet, Pushlet and etc.
    """    
    def handle(self, data):
        """
        Handle data transfered within session.
        Data type could be raw or wrapped HTTP and anything else,
        it depends on implementation.
        """
	raise NotImplementedError()
    pass
pass

class Manager(object):
    """
    Abstract 'connection' manager.
    This package was designed to replace raw connection with 'Session',
    so managed connections are sessions indeed.
    """
    sessions = {} # sessions dictionary, key: sid, value: session.
    handlers = [] # data handlers, which registered on this manager.
    users = {} # users dictionary, key: userid, value: sid.

    def createSid(self, userid):
	""" Create session id. """
	return unicode('sid-' + str(userid), settings.ENCODING)
    
    def createSession(self, sid, request, method='POST'):
	""" 
        Create session. 
        sid is session id to create with,
        request is a HTTP request.
        Implementation must return a tuple in form of (session, result)
        which session is created session or None,
        result is a json serializable object.
        """
	raise NotImplementedError()

    def connect(self, request, method='POST'):
        """ 
        Connect to connection manager. 
        Request passed in is a HTTP request.
        Implementation must return a json serializable object.
        """
        raise NotImplementedError()

    def accept(self, userid, request, method='POST'):
	"""
	Accept create request and create session for user.
	"""
        sid = self.createSid(userid)
        if sid in self.sessions:
	    logger.debug('a session bind with %s already exists.', sid)
	    # terminate existed session.
	    session = self.sessions[sid]
	    session.close(condition='other-request')
	    self.terminateSession(session)
	    pass

	session, response = self.createSession(sid, request, method)
        if session is not None:
            self.sessions[session.sid] = session
            self.users[userid] = sid
	return response

    def getSession(self, sid):
	"""
	Get session for given user.
	"""
	if sid in self.sessions:
	    # logger.debug('session bind with %s exists.', sid)
	    return self.sessions[sid]
	else:
            raise KeyError('session matches sid: ' + sid + ' not found.')
        pass
        
    def getUserSession(self, userid):
        """
        Get user's session.
        """
        if userid in self.users:
            sid = self.users[userid]
            return self.getSession(sid)
        else:
            return None
            
    def disconnected(self, session):
        session.close()
        self.terminateSession(session)
        pass
        
    def handleRequest(self, session, request):
	"""
	Handle data from client's poll request.
        If any application registered handler on session manager,
        connection manager should dilivery data to application.
        Connection manager should act like a transparent proxy in front of applications.
	"""
	for handler in self.handlers:
	    match = handler.regex.match(session.to)
	    if match is not None:
		handler.handle(request)
		pass
	    pass
        pass
    
    def addHandler(self, handler):
        """
        Register an application request handler.
        """
        self.handlers.append(handler)

    def terminateSession(self, session):
	""" Terminate session. """
	del self.sessions[session.sid]
	pass
