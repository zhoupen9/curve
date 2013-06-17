
!(function () {
	// "use strict";
    // BOSH scheme was documented as an xml scheme in XEP-0124:
    // http://www.xmpp.org/extensions/xep-0124.html
	var
	Connection = function () {},
	BOSHProtocol = function () {};

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

		// initial session schema.
		initialize: [
			'rid',
			'to',
			'wait',
			'ver',
			'hold',
			'lang',
			'charsets',
		],

		// request schema.
		request: [
			'sid',
			'rid',
		],

		// terminate schema.
		terminate: [
			'sid',
			'rid',
			'type',
		],

		// create BOSH request.
		create: function (schema, data) {
			return this.validate(schema, data);
		},

		// check if given data is valid.
		// This method always return data, if any errors occurred,
		// it throws an Error.
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
			return data;
		}
	};

	// BOSH session.
	// Instance may trigger events: "received.session", "sent.session"
	Connection.prototype = {
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
			wait: 60, // max time to wait in seconds.
			requests: 2,
			polling: 30, // by default, client doe not perform pure polling.
		},

		// create session.
		create: function (to, options) {
			this.sid = undefined;
			this.to = to;
			this.options = $.extend({}, options);
			this.protocol = new BOSHProtocol();
			this.status = this.Status.created;
			this.handlers = [];
		},

		// generate a request id.
		nextrid: function () {
			this.rid = this.rid || (10000 + Math.round(Math.random() * 10000));
			return ++this.rid;
		},

		// Connect to host.
		connect: function (host) {
			var that = this, deferred = $.Deferred(),
			request = this.protocol.create(this.protocol.initialize, {
				to: host,
				rid: this.nextrid(),
				wait: this.options.wait,
				hold: this.options.hold,
				ver: this.options.ver,
				lang: this.options.lang,
				charsets: this.options.charsets
			});

			this.status = this.Status.connecting;

			// $[this.method](host, request, null, 'json')
			// 	.done(function (data) {
			// 		deferred.resolve(that, data);
			// 	})
			// 	.fail(function (data) {
			// 		deferred.reject(that, data);
			// 	});
			deferred.reject(that, 'disabled for debugging...');

			deferred.done(this.connectDone).fail(this.connectFailed);
			return deferred.promise();
		},

		// Add a data handler.
		// When connection received data, handler will be notified.
		addHandler: function (handler) {
			handler && this.handlers.indexOf(handler) === -1 && this.handlers.push(handler);
		},

		// If session is currently connected.
		isConnected: function () {
			return this.status === this.Status.connected;
		},

		// send data to BOSH connection manager.
		send: function (data) {
			var that = this,
			deferred = $.Deferred(),
			data = data || {},
			request = this.protocol.create(this.protocol.request, {
				sid: this.sid,
				rid: this.nextrid(),
				data: data
			});

			if (!this.isConnected()) {
				throw new Error('Connection is net connected.');
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
		onReceive: function (connection, response) {
			var i, request;

			response = typeof response === 'string' ? JSON.parse(response) : response;
			if (response && !$.isEmptyObject(response)) {
				// Potensial problem, if connection is receiving data,
				// and a new handler added, that handler may results differently,
				// it may or may not receive data in this transition.
				for (i = 0; i < connection.handlers.length; i++) {
					connection.handlers[i].call(connection, response);
				}
			}

			// decrease current requests.
			--connection.current;

			// client SHOULD send another request to poll incoming data immediately.
			switch (connection.current) {
			case connection.Requests.clean:
				// if session is currently clean, send another request,
				// the request to be sent will be empty if no data pending,
				// or the head data in pending list.
				request = connection.pending && connection.pending.pop();
				$.debug(request ? 'sending request...' : 'keep polling...');
				connection.send(request || {});
				break;
			case connection.Requests.polling:
			default:
				// if connection is currently polling. do nothing.
				break;
			}
		},

		// Handle send failed due to broken connection.
		onBroken: function (connection, response) {
			connection.close();
		},

		// Receive data from connection.
		// Since data always received in send response (see BOSH),
		// this method only trial data already received in send response.
		recv: function () {
			if (!this.isConnected()) {
				throw new Error('connection is not connected.');
			}
			return this.received && this.received.pop()
		},

		// Close connection, sent terminate request to server.
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

		// clean up connection after it was closed.
		cleanup: function () {
			if (this.received) {
				while (this.received.length) {
					this.received.pop();
				}
				delete this.received;
			}
		},

		// Handle connection connect done.
		connectDone: function (connection, response) {
			var connection, to = response.to;

			if (response.type && response.type === 'terminate') {
				// connection failed to create due to server terminated.
				$.debug('connection failed to connect.');
				connection.status = connection.Status.disconnected;
				connection.cleanup();
				return;
			}

			$.debug('Connected to:', to);
			connection.status = connection.Status.connected;
			connection.sid = response.sid;
			$.extend(connection.options, {
				wait: Math.min(response.wait, connection.options.wait),
				requests: Math.max(response.requests, connection.options.requests),
				polling: response.polling || connection.options.polling,
			});

			// since connection established, start polling.
			connection.send();
		},

		// Handle session connect failed.
		// Manager may want to reconnect in a future.
		connectFailed: function (connection, response) {
			$.debug('Faield to connect to:', response ? response.to : 'no response');
			connection.status = connection.Status.disconnected;
			connection.cleanup();
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
			polling: 30,
		},

		// create component.
		create: function () {
			this.connections = [];
		},

		// Get connection.
		get: function (host) {
			if (host in this.connections) {
				return this.connections[host];
			} else {
				$.debug('connection matches:', host, ' not found.');
			}
		},

		// Try to connect to server to create a connection.
		connect: function (host) {
			var connection = new Connection();
			connection.create(host, this.options);
			// save connection, notice that sesion not fully created yet.
			this.connections[host] = connection;
			return connection.connect(host);
		},

		// Try to close current connection.
		disconnect: function (host) {
			var connection = this.connections[host];
			if (!connection) {
				$.debug('Connection matches:', host, ' not found');
				throw new Error('connection not found.');
			} else {
				if (connection.isConnected()) {
					connection.close().always(function () {
						delete this.connections[host];
					});
				} else {
					delete this.connections[host];
				}
			}
		}
	});
}($));
