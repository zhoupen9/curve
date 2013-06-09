
from threading import Event
from multiprocessing import Process
import uuid
import logging

logger = logging.getLogger('curve')

class Connection(object):
    """
    Connection between server and client.
    """
    alive = False
    data = None
    def __init__(self, user):
        self.id = uuid.uuid1()
        self.user = user
        self.alive = True
        self.event = Event()

    def is_alive(self):
        return self.alive

    def activate(self):
        if not self.alive:
            self.alive = True

    def disconnect(self):
        self.alive = False

    def send(self, data):
        """
        Send data on connection.
        """
        logger.debug('connection %s current state: %s', self.id, str(self.alive))
        if not self.alive:
            raise RuntimeError('connection not active.')
        self.data = data
        self.event.set()

    def poll(self):
        """
        Try to poll data from connection.
        This method does not return any data if there's data in connection
        ready to be received.
        If there's no data for receive in connection, this method will block
        until data arrived.
        """
        if not self.alive:
            raise RuntimeError('connection not active.')
        # wait to be notified.
        self.event.wait()
        return True

    def recv(self):
        """
        Try to receive data from connection.
        """
        if not self.alive:
            raise RuntimeError('connection not active.')
        # clear event and block poll.
        if not self.event.is_set():
            self.event.clear()
        data = self.data
        del self.data
        self.data = None
        return data

class Manager(object):
    # connection child process.
    process = None

    # all connections.
    connections = {}

    def worker(self):
        logger.debug('starting connection manager process...')
        pass

    def start(self):
        self.process = Process(target=self.worker)
        self.process.start()

    def stop(self):
        """
        Stop connection manager.
        """
        if self.process is not None:
            logger.debug('stopping connection manager process...')
            self.process.join()
        else:
            logger.debug('connection manager already stopped.')

    def create(self, userid):
        """
        Create connection for user.
        """
        connection = Connection(userid)
        self.connections[userid] = connection
        return connection
        
    def get(self, userid):
        """
        Get connection for given user.
        If there's no connection bind with given user, create a new one.
        """
        if userid in self.connections:
            logger.debug('connection bind with %s exists.', userid)
            return self.connections[userid]
        else:
            logger.debug('connection bind with %s NOT FOUND, create one.', userid)
            return self.create(userid)

Connection.manager = Manager()
