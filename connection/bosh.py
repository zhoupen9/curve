
from django.utils import simplejson
from datetime import datetime
from session import Session
from manager import Manager

import logging

logger = logging.getLogger('curve')

# class Create(object):
#     attributes = [
#         'to',# This attribute specifies the target domain of the first stream.
#         'lang', # xml:lang This attribute specifies the default language of any human-readable XML character data sent or received during the session.
#         'ver', # This attribute specifies the highest version of the BOSH protocol that the client supports.
#         'wait', # This attribute specifies the longest time (in seconds) that the connection manager is allowed to wait before responding to any request during the session.
#         'hold', # This attribute specifies the maximum number of requests the connection manager is allowed to keep waiting at any one time during the session.
#         ]
#     pass

class Scheme(object):
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
        
class BoshManager(Manager):
    """
    BOSH connection manager.
    This class implement XMPP Bidirectional-streams Over Synchronous HTTP (BOSH),
    which was defined in XEP-0124, http://xmpp.org/extensions/xep-0124.html
    """
    sessions = {}

    def success(self, data=None):
        result = {}
        if data:
            result['data'] = data
        return simplejson.dumps(result)
    
    def createSessionInternal(self, connection):
        """
        Create a bosh session.
        """
        if connection is None:
            raise ValueError('connection can not be none.')

        conn_id = connection.id
        if conn_id in self.sessions:
            logger.debug('a session bind with %d already exists.', conn_id)
            self.close(self.sessions[conn_id])
            return None

        session = BoshSession()
        session.connections[COMMAND_CONNECTION] = connection

        result = {}
        
        # session.send(self.success(createResponse))
        return session

    def createInternal(self):
        



# Bosh session's default manager.
BoshSession.manager = BoshManager()
