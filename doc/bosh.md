
BOSH implementation
=====

BOSH, Bidirectional-streams Over Synchronous HTTP technology.

The protocol documented by this schema is defined in
[XEP-0124](http://www.xmpp.org/extensions/xep-0124.html)

Documents below demostrates a simple implementation which uses JSON
instead of XML format.

# Session
Session a connection orient abstraction.

## Create
Client request a session by sending a request which conforms to request schema.

Server must response to this request, if request accepted an associated session
**should** be created. Response **must** be form of:
```javascript
schema: {
	to: '',
	rid: '',
	wait: '',
	ver: '',
	polling: '',
	inactivity: '',
	requests: '',
	hold: '',
	to: ''
}
```
## Terminate

Client can request to terminate session anytime. Request schema:
```javascript
schema: {
	sid: 'SomeSID',
	rid: rid,
	type: 'terminate'
}
```
Server **must** response to terminate request with:
```javascript
schema: {
	type: 'terminate'
}
```
## Send
Client can send and receive data payload via http binding, after the client
has successfully completed all required preconditions.
```javascript
schema: {
	sid: 'SomeSID',
	rid: '',
	data: {
		'foo': 'bar'
	}
}
```
Send/Receive process.

    Client | Server
    --- | ---
    send 'Send' request |
     | resposne an empty reponse if no data wait to send in 'wait' time.
     | response queued data.

Server empty response:
```javascript
schema: {
	// nothing.
}
```
Server response with queued data:
```javascript
schema: {
	data: {
		'foo': 'bar'
	}
}
```
## Receive
