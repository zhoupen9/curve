
// jquery logging plugin.
(function ($) {
	// "use strict";
	
	// Logging class.
	var log, Logging = function () {},

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
	},
	// log record.
	Record = function () {},
	// log.
	Log = function () {},
	// fomat.
	Format = function () {},
	// simple format.
	SimpleFormat = function () {};

	// Abstract formatter.
	Format.prototype = {
		format: $.noop
	};

	// Simple format.
	SimpleFormat.prototype = {
		// format date time to readable.
		formatTime: function (date) {
			return '[' + date.getMonth() + '/' + date.getDate() + '/' +
				date.getFullYear() + ' ' + date.getHours() + ':' +
				date.getMinutes() + ':' + date.getSeconds() + ']';
		},

		// format a log entry.
		format: function (entry) {
			var i, v, ary, type = entry.type, value = entry.value, formatted = '';
			if (type === 'object') {
				if (Array.isArray(value)) {
					ary = [];
					for (i = 0; i < value.length; i++) {
						ary.push(this.format(new Entry(value[i])));
					}
					formatted += '[' + ary.join(',') + ']';
				} else {
					fomatted += value instanceof Date ? this.formatTime(value) : value.toString();
				}
			} else {
				formatted += value;
			}
			return formatted;
		}
	};

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

	Log.prototype = {
		// default log will not persistant records.
		persistant: false,

		// default output console.
		output: console,

		// set log level.
		setLevel: function (level) {
			this.level = Logging.prototype.levels[level];
		},

		// set log format.
		setFormat: function (format) {
			this.format = format;
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
		
		// write log.
		write: function (record) {
			var out = [], index, entry;

			for (index = 0; index < record.entries.length; index++) {
				entry = record.entries[index];
				out.push(this.format.format(entry));
			}

			this.output.log(out.join(','));
		},
		
		// format log message.
		log: function (level, arguments) {
			var record = new Record(), index, value,
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
			this.write(record);
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
	log.setFormat(new SimpleFormat());
	
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
