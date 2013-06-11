
from django.utils import simplejson
from datetime import datetime
from session import Session
from manager import Manager

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

class Connection(object):
    """
    BOSH connection.
    BOSH connection is based on HTTP connection.
    """
    def __init__(self):
        self.createTime = datetime.now()

COMMAND_CONNECTION = 1
DATA_CONNECTION = 2

class BoshSession(Session):
    """
    BOSH session implementation.
    """
    connections = {}
    dataPending = []
    requests = []
    
    def getConnection(self, connectionType):
        """
        Try to get active connection within session.
        If there's no active connection, a RuntimeError will raise.
        """
        if connectionType in self.connections:
            return self.connections[connectionType]
        else:
            raise RuntimeError('no active connection.')
        
    def send(self, data):
        """
        Try to send data in session.
        If there's no active command connection, server will close session.
        """
        self.dataPending.append(data)
        # send response on command connection and wait a data connection
        # to poll data.
        try:
            conn = self.getConnection(COMMAND_CONNECTION)
            conn.response()
        except RuntimeError:
            self.close()
        pass

    def recv(self):
        """
        Try to receive data from BOSH session.
        If there's no active connection in sessoin, server will close session.
        """
        try:
            # receive data from data connection.
            conn = self.getConnection(DATA_CONNECTION)
            data = conn.recv()
            return data
        except RuntimeError:
            logger.debug('no active data connection, server close session.')
            self.close()
        pass

    def close(self):
        super(BoshSession, self).close()
        try:
            conn = self.getConnection(COMMAND_CONNECTION)
            conn.close()
        except:
            pass

        pass
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
    pass

class Terminate(Schema):
    schema = [
        'type',
        'condition',
        ]
    pass

        
class BoshManager(Manager):
    """
    BOSH connection manager.
    This class implement XMPP Bidirectional-streams Over Synchronous HTTP (BOSH),
    which was defined in XEP-0124, http://xmpp.org/extensions/xep-0124.html
    """
    sessions = {}
    # server default wait time in seconds.
    version = '0.1'
    wait = 60
    polling = False
    inactivity = 60
    requests = 2
    hold = 1

    def getSid(self, userid):
        return 'sid-'.concat(userid)

    def success(self, data=None):
        result = {}
        if data:
            result['data'] = data
        return simplejson.dumps(result)
    
    def createSession(self, userid, request):
        """
        Create a bosh session.
        """
        result = {}
        if request is None:
            raise ValueError('connection can not be none.')

        if userid in self.sessions:
            logger.debug('a session bind with %d already exists.', userid)
            result['response'] = self.responseToCreate(False)
            result['session'] = None
        else:
            session = BoshSession()
            # session.connections[COMMAND_CONNECTION] = connection
            result['session'] = session
            result['respeone'] = self.responseToCreate()
            
        return result

    def terminate(self, condition, session=None):
        """ Terminate session or creating session. """
        if session is not None:
            del self.sessions[session.id]
            
        response = Terminate()
        response.type = 'terminate'
        response.condition = condition
        return response

    def responseToCreate(self, success=True):
        if success:
            response = ConnectResponse()
            response.sid = self.getSid()
            response.wait = self.wait
            response.ver = self.version
            response.polling = self.polling
            response.inactivity = self.inactivity
            response.requests = self.requests
            response.hold = self.hold
            response.to = 'to'
        else:
            response = self.terminate()
        return response
    pass


# Bosh session's default manager.
BoshSession.manager = BoshManager()
