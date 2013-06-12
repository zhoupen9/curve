Connection
=====

Connection was implemented by BOSH technology, which was documented as
[XEP-0124](http://www.xmpp.org/extensions/xep-0124.html)

Realtime applications (client and server) need connect to connection manager.

Realtime application client (e.g. messaging) does not talk to server
application directly, it **SHOULD** talk to connection manager, and connection
manager will delivery requests to the application if conditions fit.

Application must register on connection manager to told connection manager
where the data package should be deliveried.
```python
from connection import Manager
def init(self):
	Manager.instance.register(r'^im/send$', self.send)

def send(self, request):
	# parse request.
	# delivery message.
```
