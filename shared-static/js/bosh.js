
!(function () {
    // BOSH scheme was documented as an xml scheme in XEP-0124:
    // http://www.xmpp.org/extensions/xep-0124.html
	var
	Session = function () {},
	schema = {
        'accept': 'string',
        'ack': 'number', // positive integer
        'authid': 'string',
        'charsets': 'string', // xs:NMTOKENS
        'condition': [ // xs:NCName
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
        'content': 'string',
        'from': 'string',
        'hold': 'number', // unsigned byte
        'inactivity': 'number', // unsigned short
        'key': 'string',
        'maxpause': 'number', // unsigned short
        'newkey': 'string',
        'pause': 'number', // unsigned short
        'polling': 'number', // unsigned short
        'report': 'number', // positive integer
        'requests': 'number', // unsigned byte
        'rid': 'number', // positive integer
        'route': 'string',
        'sid': 'string',
        'stream': 'string',
        'time': 'number', // unsigned short
        'to': 'string',
        'type': [ // xs:NCName
            'error',
            'terminate',
        ],
        'ver': 'string',
        'wait': 'number', // unsigned short
        'lang': 'string', // xml:lang
	};

	Session.prototype = {
	};

	$.curve.plugin('session', {
		options: {
			wait: 180, // max time to wait in seconds.
			requests: 2,
			polling: false,
		},

		create: function () {
		},

		close: function () {
		},

		send: function (data) {
		},

		recv: function () {
		}
	});
}($));
