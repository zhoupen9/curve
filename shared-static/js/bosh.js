
!(function () {
	// "use strict";
    // BOSH scheme was documented as an xml scheme in XEP-0124:
    // http://www.xmpp.org/extensions/xep-0124.html
	var
	Session = function () {},
	BOSHProtocol = function () {},
	SessionInitializer = function() {},
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
			var index, key, type;

			if (!data) {
				return false;
			}

			for (index in schema) {
				key = schema[index]
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
			'charsets',
		],

		// create initial BOSH session request.
		create: function (protocol, to, rid, wait, hold, ver, lang, charsets) {
			var request = {
				to: to,
				lang: lang,
				ver: ver,
				wait: wait,
				hold: hold,
				rid: rid,
				charsets: charsets,
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
			var request = {
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
		create: function (to, options) {
			this.sid = undefined;
			this.to = to;
			this.options = $.extend({}, options);
			this.protocol = new BOSHProtocol();
			this.initializer = new SessionInitializer();
			this.requestor = new SessionRequestor();
			this.terminator = new SessionTerminator();
			this.status = this.statuses.created;
		},
		
		// generate a request id.
		nextrid: function () {
			this.rid = this.rid || (10000 + Math.round(Math.random() * 10000));
			return ++this.rid;
		},

		// Connect to host.
		connect: function (host) {
			var that = this, request = this.initializer.create(
				this.protocol,
				host,
				this.nextrid(),
				this.options.wait,
				this.options.hold,
				this.options.ver,
				this.options.lang,
				this.options.charsets
			), deferred = $.Deferred();

			this.status = this.statuses.connecting;

			$[this.method](host, request)
				.done(function (data) {
					deferred.resolve(that, data);
				})
				.fail(function () {
					deferred.reject(that, data);
				});

			deferred.done(this.connectDone).fail(this.connectFailed);
			return deferred.promise();
		},

		// If session is currently connected.
		isConnected: function () {
			return this.status === this.statuses.connected;
		},

		// send data to BOSH connection manager.
		send: function (data) {
			var that = this, request = this.requestor.create(this.protocol, this.sid, this.nextrid(), data);

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
			$[this.method](this.to, request)
				.done(this.onReceive)
				.fail(this.onBroken)
				.always(function () {
					// that.trigger('sent.session');
				});
		},

		// Handle http connection response (receive data from server in BOSH).
		onReceive: function (response) {
			var request;
			this.received = this.received || [];
			if (response.data) {
				// server send queued data back.
				this.received.push(data);
				// this.trigger('received.session');
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
			return $[this.method](this.to, terminate)
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
		connectDone: function (session, response) {
			var session, to = response.to;
			
			if (response.type && response.type === 'terminate') {
				// connection failed to create due to server terminated.
				$.debug('session failed to connect.');
				session.status = session.statuses.disconnected;
				session.cleanup();
				return;
			}
			
			$.debug('Connected to:', to);
			session.status = session.statuses.connected;
			session.sid = response.sid;
			$.extend(session.options, {
				wait: Math.min(response.wait, session.options.wait),
				requests: Math.max(response.requests, session.options.requests),
				polling: response.polling || session.options.polling,
			});
		},

		// Handle session connect failed.
		// Manager may want to reconnect in a future.
		connectFailed: function (session, response) {
			$.debug('Faield to connect to:', response ? response.to : 'no response');
			session.status = session.statuses.disconnected;
			session.cleanup();
		}
	};

	// register local manager as curve's component.
	$.curve.component('CM', {
		// default options for all session.
		options: {
			ver: '0.1',
			hold: 1,
			lang: 'en',
			charsets: 'UTF-8',
			wait: 60,
			requests: 2,
			polling: false,
		},

		// create component.
		create: function () {
			this.sessions = [];
		},

		// Get session.
		get: function (host) {
			if (host in this.sessions) {
				return this.sessions[host];
			} else {
				$.debug('session matches:', host, ' not found.');
			}
		},
		
		// Try to connect to server to create a session.
		connect: function (host, to, data) {
			var session = new Session();
			session.create(to, this.options);
			// save session, notice that sesion not fully created yet.
			this.sessions[host] = session;
			return session.connect(host, data);
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
