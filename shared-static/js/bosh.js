
!(function () {
	// "use strict";
    // BOSH scheme was documented as an xml scheme in XEP-0124:
    // http://www.xmpp.org/extensions/xep-0124.html
	var
	Session = function () {},
	BOSHProtocol = function () {},
	SessionInitailizer = function() {},
	SessionRequestor = function () {},
	SessionTerminator = function () {};

	// BOSH protocl.
	BOSHProtocol.prototype = {
		// This implemenation version.
		ver: '0.1',
		// Default language support.
		lang: 'en',
		// Default encoding character set.
		charset: 'UTF-8',
		// Implementation schema.
		schema: {
			accept: 'string',
			ack: 'number', // positive integer
			authid: 'string',
			charsets: 'string', // xs:NMTOKENS
			condition: [ // xs:NCName
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
			],
			content: 'string',
			from: 'string',
			hold: 'number', // unsigned byte
			inactivity: 'number', // unsigned short
			key: 'string',
			maxpause: 'number', // unsigned short
			newkey: 'string',
			pause: 'number', // unsigned short
			polling: 'number', // unsigned short
			report: 'number', // positive integer
			requests: 'number', // unsigned byte
			rid: 'number', // positive integer
			route: 'string',
			sid: 'string',
			stream: 'string',
			time: 'number', // unsigned short
			to: 'string',
			type: [ // xs:NCName
				'error',
				'terminate',
			],
			ver: 'string',
			wait: 'number', // unsigned short
			lang: 'string', // xml:lang
		},

		// check if given data is valid.
		validate: function (schema, data) {
			var key, type;

			if (!data) {
				return false;
			}

			for (key in schema) {
				type = this.schema[key];
				// check given schema.
				if (!type) {
					$.debug(key, ' is not a valid attribute.');
					return false;
				}
				// check if data conforms to given schema.
				if (!data[key]) {
					$.debug('missing attribute:', key);
					return false;
				}
				// check if data type conforms to BOSH schema.
				if (typeof(data[key]) !== type) {
					$.debug(key, ' has invalid value type.');
				}
			}
			return true;
		}
	};

	SessionInitializer.prototype = {
		schema: [
			'rid',
			'to',
			'wait',
			'ver',
			'hold',
			'lang',
			'charset',
		],

		// create initial BOSH session request.
		create: function (protocol, to, rid, wait, hold) {
			var request = {
				to: to,
				lang: schema.lang,
				ver: schema.ver,
				wait: wait,
				hold: hold,
				rid: rid
			};
			return protocol.validate(this.schema, request) ? request : null;
		}
	};

	SessionRequestor.prototype = {
		schema: [
			'sid',
			'rid',
		],

		// create session request.
		create: function (protocol, sid, rid, data) {
			var reqeust = {
				sid: sid,
				rid: rid,
			};

			if (data) {
				request.data = data;
			}

			return protocol.validate(this.schema, request) ? request : null;
		}
	};

	SessionTerminator.prototype = {
		schema: [
			'sid',
			'rid',
			'type',
		],

		// create session terminate request.
		create: function (protocol, sid, rid, type) {
			var request = {
				sid: sid,
				rid: rid,
				type: type,
			};
			return protocol.validate(this.schema, request) ? request : null;
		}
	};

	// BOSH session.
	// Instance may trigger events: "received.session", "sent.session"
	Session.prototype = {
		// default http request method.
		method: 'post',

		// status.
		statuses: {
			created: 0,
			connecting: 1,
			connected: 2,
			disconnected: 3,
		},

		// requests.
		requests: {
			clean: 0, // no active connections.
			polling: 1, // polling from server.
		},

		// default options.
		options: {
			wait: 180, // max time to wait in seconds.
			requests: 2,
			polling: false, // by default, client doe not perform pure polling.
		},

		// create session.
		create: function (sid, options) {
			this.sid = sid;
			this.options = $.extend({}, options);
			this.protocol = new BOSHProtocol();
			this.initializer = new SessionInitializer();
			this.requestor = new SessionRequestor();
			this.terminator = new Sessionterminator();
			this.status = this.statuses.created;
		},
		
		setDestination: function (dist) {
			this.dist = dist;
		},

		// generate a request id.
		nextrid: function () {
			this.rid = this.rid || (10000 + Math.round(Math.random() * 10000));
			return ++this.rid;
		},

		// Connect to dist.
		connect: function (dist) {
			var	request = this.initializer.create(
				this.protocol,
				host,
				session.nextrid(),
				this.options.wait,
				this.options.hold);

			this.status = this.statuses.connecting;
			
			return $[this.method](this.connectDist, request)
				.done(this.connectDone)
				.fail(this.connectFailed);
		},

		// If session is currently connected.
		isConnected: function () {
			return this.status === this.statuses.connected;
		},

		// send data to BOSH connection manager.
		send: function (data) {
			var request = this.requestor.create(this.protocol, this.sid, this.nextrid(), data);

			if (!this.isConnected()) {
				throw new Error('Session is net connected.');
			}

			if (this.current) {
				if (this.current >= this.options.requests - 1) {
					$.debug("Can't send data right now, pending...");
					this.pending = this.pending || [];
					this.pending.push(request);
					// pending data will not be sent right now and it will not trigger 'sent.session' event.
					return;
				} else {
					// increase current requests.
					++this.current;
				}
			} else {
				this.current = this.requests.polling;
			}
			
			request = request || {};
			$[this.method](this.dist, request)
				.done(this.onReceive)
				.fail(this.onBroken)
				.always(function () {
					this.trigger('sent.session');
				});
		},

		// Handle http connection response (receive data from server in BOSH).
		onReceive: function (response) {
			var request;
			this.received = this.received || [];
			if (response.data) {
				// server send queued data back.
				this.received.push(data);
				this.trigger('received.session');
			}

			// decrease current requests.
			--this.current;
			
			// client SHOULD send another request to poll incoming data immediately.
			switch (this.current) {
			case this.status.clean:
				// if session is currently clean, send another request,
				// the request to be sent will be empty if no data pending,
				// or the head data in pending list.
				request = this.pending && this.pending.pop();
				this.send(request || {});
				break;
			case this.status.polling:
			default:
				// if session is currently polling. do nothing.
				break;
			}
		},

		// Receive data from session.
		// Since data always received in send response (see BOSH),
		// this method only trial data already received in send response.
		recv: function () {
			if (!this.isConnected()) {
				throw new Error('session is not connected.');
			}
			return this.received && this.received.pop()
		},

		// Close session, sent terminate request to server.
		// furhter data received from server will be discarded.
		close: function () {
			var terminate = {
				sid: this.sid,
				rid: this.nextrid(),
				type: 'terminate'
			};
			return $[this.method](this.dist, terminate)
				.done()
				.fail()
				.always(this.cleanup);
		},

		// clean up session after it was closed.
		cleanup: function () {
			if (this.received) {
				while (this.received.length) {
					this.received.pop();
				}
				delete this.received;
			}
		},
		
		// Handle session connect done.
		connectDone: function (response) {
			var session, to = response.to;
			
			if (response.type && response.type === 'terminate') {
				// connection failed to create due to server terminated.
				$.debug('session failed to connect.');
				this.status = this.statuses.disconnected;
				this.cleanup();
				return;
			}
			
			$.debug('Connected to:', response.to);
			this.status = this.statuses.connected;
			this.sid = response.id;
			$.extend(this.options, {
				wait: Math.min(response.wait, this.options.wait),
				requests: Math.max(response.requests, this.options.requests),
				polling: response.polling || this.options.polling,
			});
		},

		// Handle session connect failed.
		// Manager may want to reconnect in a future.
		connectFailed: function (response) {
			$.debug('Faield to connect to:', response.to);
			this.status = this.statuses.disconnected;
			this.cleanup();
		}
	};

	// register local manager as curve's component.
	$.curve.component('CM', {
		// default options for all session.
		options: {
			wait: 60,
			requests: 2,
			polling: false,
		},

		// create component.
		create: function () {
			this.sessions = [];
		},

		// Get session.
		get: function (dist) {
			if (dist in this.sessions) {
				return this.sessions[dist];
			} else {
				$.debug('session matches:', dist, ' not found.');
			}
		},
		
		// Try to connect to server to create a session.
		connect: function (host) {
			var session = new Session();
			// save session, notice that sesion not fully created yet.
			this.sessions[host] = session;
			return session.connect(host);
		},

		// Try to close current session.
		disconnect: function (host) {
			var session = this.sessions[host];
			if (!session) {
				$.debug('Session matches:', host, ' not found');
				throw new Error('session not found.');
			} else {
				if (session.isConnected()) {
					session.close().always(function () {
						delete this.sessions[host];
					});
				} else {
					delete this.sessions[host];
				}
			}
		}
	});
}($));
