
import logging

logger = logging.getLogger('curve')

class Manager(object):
    """
    Abstract 'connection' manager.
    This package was designed to replace raw connection with 'Session',
    so managed connections are sessions indeed.
    """
    # all sessions.
    sessions = {}

    def createSession(self):
	""" Create session. """
	raise NotImplementedError

    def closeSession(self, userid):
	""" Close session. """
	raise NotImplementedError

    def accept(self, userid, request):
	"""
	Accept create request and create session for user.
	"""
	result = self.createSession(userid, request)
        session = result['session']
	if session is not None:
	    self.sessions[userid] = session
	return result

    def get(self, userid):
	"""
	Get session for given user.
	If there's no session bind with given user, create a new one.
	"""
	if userid in self.sessions:
	    logger.debug('session bind with %s exists.', userid)
	    return self.sessions[userid]
	else:
	    logger.debug('session bind with %s NOT FOUND, create one.', userid)
	    return self.create(userid)

    def close(self, userid):
	"""
	Close session.
	Any further operations on closed session will raise error.
	"""
	self.closeSessionInternal(self, userid)
	del self.session[userid]
