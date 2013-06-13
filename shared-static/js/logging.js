
// jquery logging plugin.
(function ($) {
	// "use strict";
	
	var log, loggin,
	// Logging.
	Logging = function () {},
	// log record.
	Record = function () {},
	// log.
	Log = function () {},
	// fomat.
	Format = function () {},
	
	// log record entry.
	Entry = function (value) {
		if (!value) {
			this.type = 'string';
			this.value = '';
		} else {
			this.type = typeof(value);
			this.value = value;
		}
		return this;
	};


	// Log record formatter.
	Format.prototype = {
		// supported format patterns.
		patterns: [ '%time', '%level' ],

		// format target.
		format: $.noop,

		// default format.
		defaultFormat: '%time %level %message',

		// split regular expression.
		splitRegExp: /(\s+)/,

		// parse format.
		// This method parse given format and then add associated formatter
		// to this format for future uses.
		parse: function (format) {
			var i, value, segments;
			this.plains = this.plains || [];
			this.whitespaces = this.whitespaces || [];
			this.formatters = this.formatters || [];
			format = format || this.defaultFormat;
			segments = format.split(this.splitRegExp);
			for (i = 0; i < segments.length; i++) {
				value = segments[i];
				if (value.trim().length) {
					switch (value) {
					case '%time':
						this.formatters.push(this.dateFormatter);
						break;
					case '%level':
						this.formatters.push(this.levelFormatter);
						break;
					case '%message':
						this.formatters.push(this.messageFormatter);
						break;
					default:
						this.plains[i] = value;
						this.formatters.push(this.plainFormatter);
						break;
					}
				} else {
					// whitespaces.
					this.whitespaces[i] = value;
					this.formatters.push(this.whitespaceFormatter);
				}
			}
			return this;
		},

		// Format a log record.
		format: function (context) {
			var i, message = [], record = context.record, formatted = '';

			// safe checking.
			if (!this.formatters) {
				this.parse(this.defaultFormat);
			}
			
			for (i = 0; i < record.entries.length; i++) {
				message.push(this.formatEntry(record.entries[i]));
			}
			context.message = message.join('');
			for (i = 0; i < this.formatters.length; i++) {
				formatted += this.formatters[i].call(this, context, i);
			}
			return formatted;
		},

		// datetime format.
		dateFormatter: function (context) {
			date = context.date || new Date();
			return '[' + date.getMonth() + '/' + date.getDate() + '/' +
				date.getFullYear() + ' ' + date.getHours() + ':' +
				date.getMinutes() + ':' + date.getSeconds() + ']';
		},

		// level format.
		levelFormatter: function (context) {
			return context.level.name;
		},

		// message format.
		messageFormatter: function (context) {
			return context.message || '';
		},

		// plain text format.
		plainFormatter: function (context, index) {
			return this.plains[index];
		},

		// whitespace format.
		whitespaceFormatter: function (context, index) {
			return this.whitespaces[index];
		},

		// format a log entry.
		formatEntry: function (entry) {
			var i, v, ary, type = entry.type, value = entry.value, formatted = '';
			if (type === 'object') {
				if (Array.isArray(value)) {
					ary = [];
					for (i = 0; i < value.length; i++) {
						ary.push(this.formatEntry(new Entry(value[i])));
					}
					formatted += '[' + ary.join('') + ']';
				} else {
					formatted += value.toString();
				}
			} else if (type === 'string') {
				formatted += value;
			} else if (type === 'number') {
				formatted += value + ',';
			} else {
				formatted += value;
			}
			return formatted;
		}

	};

	// Log record.
	// A log record contains serveral entries inside.
	Record.prototype = {
		// add an entry.
		add: function (entry) {
			this.entries = this.entries || [];
			this.entries.push(entry);
		},

		// clear log record.
		clear: function () {
			while (this.entries && this.entries.length) {
				this.entries.pop();
			}
		}
	};

	// Logger.
	// The name of code below really should be 'Logger'.
	Log.prototype = {
		// default log will not persistant records.
		persistant: false,

		// set log level.
		setLevel: function (level) {
			this.level = Logging.prototype.levels[level];
		},

		// set log format.
		setFormat: function (format) {
			this.format = format;
			
		},

		// add handler.
		addHandler: function (handler) {
			this.handlers = this.handlers || [];
			this.handlers.push(handler);
		},

		// create log record.
		add: function (record) {
			if (this.persistant) {
				this.records = this.records || [];
				this.records.push(record);
			}
		},

		// clear log.
		clear: function () {
			while (this.records && this.records.length) {
				this.records.pop().clear();
			}
		},

		// check if given level is loggable according to this log's level.
		loggable: function (level) {
			if (!this.level) {
				return true;
			}
			return level.level >= this.level.level;
		},
		
		// format log message.
		log: function (level, arguments) {
			var record = new Record(), index, value, formatted, context = {};
			ary = Array.prototype.slice.call(arguments);

			if (!this.loggable(level)) {
				return;
			}
			
			for (index = 0; index < ary.length; index++) {
				value = ary[index];
				record.add(new Entry(value));
			}
			// save log record.
			this.add(record);
			// write.
			if (this.handlers) {
				context.level = this.level;
				context.record = record;
				context.date = new Date();
				formatted = this.format.format(context);
				for (index = 0; index < this.handlers.length; index++) {
					// NOTE normally, handler should handle log record instead of formatted content.
					this.handlers[index].call(this, formatted);
				}
			}
		},

		// convenient method for logging at "debug" level.
		debug: function () {
			this.log(Logging.prototype.levels.debug, arguments);
		},

		// convenient method for logging at "info" level.
		info: function () {
			this.log(Logging.prototype.levels.info, arguments);
		},

		// convenient method for logging at "warn" level.
		warn: function () {
			this.log(Logging.prototype.levels.warn, arguments);
		},

		// convenient method for logging at "error" level.
		error: function () {
			this.log(Logging.prototype.levels.error, arguments);
		}		
	};

	// Logging prototype.
	Logging.prototype = {
		// logging supported levels.
		levels: {
			debug: {
				name: 'DEBUG',
				level: 0
			},
			info : {
				name: 'INFO',
				level: 1
			},
			warn: {
				name: 'WARN',
				level: 2
			},
			error: {
				name: 'ERROR',
				level: 3
			}
		},

		// default output.
		output: console,

		// loggers.
		loggers: [],

		// get logger.
		getLogger: function (name) {
			var log;
			name = name ? name : 'default';
			log = this.loggers[name];
			if (!log) {
				log = this.addLogger(name, new Log());
			}
			return log;
		},

		// add logger.
		addLogger: function (name, logger) {
			if (this.loggers[name]) {
				throw new Error('logger with name: ' + name + ' already exists.');
			}
			this.loggers[name] = logger;
			return logger;
		}
	};

	// local logger.
	log = new Log();
	log.setLevel($.curve ? $.curve.setting('logging').level : 'debug');
	log.setFormat(new Format()); // default format.
	log.addHandler(function (message) {
		console.log(message);
	});
	
	// create local logging.
	logging = new Logging();
	logging.addLogger('default', log);

	// register all logging methods to jquery.
	$.each(['debug', 'info', 'warn', 'error'], function (index, value) {
		var origFn = $[value], fn = {};

		// extends jquery to plugin logging funcilities.
		fn[value] = function (message) {
			var ret = log[value] && log[value].apply(log, arguments);
			return (origFn && origFn.apply(this, arguments)) || ret;
		};
		
		$.extend(fn);
	});

	// extend jquery to provide logging facilities.
	$.extend({
		getLogger: function (name) {
			return logging.getLogger(name);
		}
	});
}($));
