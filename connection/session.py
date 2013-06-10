import uuid

OPEN = 1
CLOSED = 2

status = {
    OPEN: 'open',
    CLOSED: 'closed'
    }

class SessionIdGenerator(object):
    def next(self):
        return self.generate()

class Session(object):
    """
    Abstract session.
    A session is a connection orient abstraction.
    """
    def __init__(self):
        self.id = self.idgenerator.next()
        pass
    
    def open(self):
        self.status = status[OPEN]
        pass

    def close(self):
        self.status = status[CLOSED]
        pass

    def send(self, data):
        """
        Send data within session.
        """
        raise NotImplementedError

    def recv(self, data):
        """
        Receive data from session.
        """
        raise NotImplementedError

class UUIDGenerator(SessionIdGenerator):
    """
    UUID base session id generator.
    """
    def generate(self):
        return uuid.uuid1()
    
# provide a default id generator base on uuid.
Session.idgenerator = UUIDGenerator()
