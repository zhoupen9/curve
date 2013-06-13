import uuid

OPEN = 1
CLOSED = 2

SESSION_STATUS = (OPEN, CLOSED)

class Session(object):
    """
    Abstract session.
    A session is a connection orient abstraction.
    Subclasses of this class must implement send() and recv().
    """
    def __init__(self):
        self.id = next(self.idgenerator)
        pass
    
    def open(self):
        self.status = OPEN
        pass

    def close(self):
        self.status = CLOSED
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

def UUIDGenerator():
    """
    UUID base session id generator.
    """
    while True:
        yield uuid.uuid1()
    
# provide a default id generator base on uuid.
Session.idgenerator = UUIDGenerator()
