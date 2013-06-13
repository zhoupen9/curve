
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
				throw new Error('Given data is empty.');
			}

			for (index in schema) {
				key = schema[index]
				type = this.schema[key];
				// check given schema.
				if (!type) {
					$.debug(key, ' is not a valid attribute.');
					throw new Erorr(key + ' is not a valid attribute.');
				}
				// check if data conforms to given schema.
				if (!data[key]) {
					$.debug('missing attribute:', key);
					throw new Error('Missing attribute: ' + key);
				}
				// check if data type conforms to BOSH schema.
				if (typeof(data[key]) !== type) {
					$.debug(key, ' has invalid value type.');
					throw new Error(key + ' has invalid value type.');
				}
			}
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
			protocol.validate(this.schema, request);
			return request;
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

			protocol.validate(this.schema, request);
			return request;
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
			protocol.validate(this.schema, request);
			return request;
		}
	};

	// BOSH session.
	// Instance may trigger events: "received.session", "sent.session"
	Session.prototype = {
		// default http request method.
		method: 'post',

		// status.
		Status: {
			created: 0,
			connecting: 1,
			connected: 2,
			disconnected: 3,
		},

		// requests.
		Requests: {
			clean: 0, // no active connections.
			polling: 1, // polling from server.
		},

		// default options.
		options: {
			wait: 10, // max time to wait in seconds.
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
			this.status = this.Status.created;
		},
		
		// generate a request id.
		nextrid: function () {
			this.rid = this.rid || (10000 + Math.round(Math.random() * 10000));
			return ++this.rid;
		},

		// Connect to host.
		connect: function (host) {
			var that = this, deferred = $.Deferred(),
			request = this.initializer.create(
				this.protocol,
				host,
				this.nextrid(),
				this.options.wait,
				this.options.hold,
				this.options.ver,
				this.options.lang,
				this.options.charsets
			);

			this.status = this.Status.connecting;

			$[this.method](host, request, null, 'json')
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
			return this.status === this.Status.connected;
		},

		// send data to BOSH connection manager.
		send: function (data) {
			var that = this, deferred = $.Deferred(),
			request = this.requestor.create(this.protocol, this.sid, this.nextrid(), data);

			if (!this.isConnected()) {
				throw new Error('Session is net connected.');
			}

			if (this.current) {
				if (this.current >= this.options.requests - 1) {
					$.debug("Can't send data right now, pending...");
					this.pending = this.pending || [];
					this.pending.push(request);
					// pending data will not be sent right now and it will not trigger 'sent.session' event.
					return deferred.reject('pending');
				} else {
					// increase current requests.
					++this.current;
				}
			} else {
				this.current = this.Requests.polling;
			}
			
			request = request || {};
			$[this.method](this.to, request)
				.done(function (response) {
					deferred.resolve(that, response);
				})
				.fail(function (response) {
					deferred.reject(that, response);
				})
				.always(function () {
					// that.trigger('sent.session');
				});

			deferred.done(this.onReceive).fail(this.onBroken);
			return deferred.promise();
		},

		// Handle http connection response (receive data from server in BOSH).
		onReceive: function (session, response) {
			var request;
			session.received = session.received || [];
			if (response.data) {
				// server send queued data back.
				session.received.push(data);
				// session.trigger('received.session');
			}

			// decrease current requests.
			--session.current;
			
			// client SHOULD send another request to poll incoming data immediately.
			switch (session.current) {
			case session.Requests.clean:
				// if session is currently clean, send another request,
				// the request to be sent will be empty if no data pending,
				// or the head data in pending list.
				request = session.pending && session.pending.pop();
				$.debug(request ? 'sending request...' : 'keep polling...');
				session.send(request || {});
				break;
			case session.Requests.polling:
			default:
				// if session is currently polling. do nothing.
				break;
			}
		},

		// Handle send failed due to broken connection.
		onBroken: function (session, response) {
			session.close();
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
				session.status = session.Status.disconnected;
				session.cleanup();
				return;
			}
			
			$.debug('Connected to:', to);
			session.status = session.Status.connected;
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
			session.status = session.Status.disconnected;
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
			wait: 10,
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
		connect: function (host, to) {
			var session = new Session();
			session.create(to, this.options);
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
