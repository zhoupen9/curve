
// jquery logging plugin.
(function ($) {
	// "use strict";
	
	// Logging class.
	var log, Logging = function (level) {
		this.level = this.levels[level];
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

		// default format.
		format: '',

		// default logger, console.
		logger: console,

		// check if given level is loggable according to this log's level.
		loggable: function (level, message) {
			if (!this.level) {
				return true;
			}
			return message ? level.level >= this.level.level : false;
		},

		// log.
		log: function (level, message) {
			if (this.loggable(level, message)) {
				this.logger.log(this.format(level, message));
			}
		},

		// format date time to readable.
		formatTime: function (date) {
			return '' + date.getMonth() + '/' + date.getDate() + '/' +
				date.getFullYear() + ' ' + date.getHours() + ':' +
				date.getMinutes() + ':' + date.getSeconds();
		},

		// format log message.
		format: function (level, message) {
			var time = new Date();
			return '[' + this.formatTime(time)  + '] ' + level.name + ' ' + message;
		},

		// convenient method for logging at "debug" level.
		debug: function (message) {
			this.log(this.levels.debug, message);
		},

		// convenient method for logging at "info" level.
		info: function (message) {
			this.log(this.levels.info, message);
		},

		// convenient method for logging at "warn" level.
		warn: function (message) {
			this.log(this.levels.warn, message);
		},

		// convenient method for logging at "error" level.
		error: function (message) {
			this.log(this.levels.error, message);
		}
	};

	// set default log level to "debug".
	Logging.prototype.level = Logging.prototype.levels.debug;
	
	// local logger.
	log = new Logging($.curve ? $.curve.setting('logging').level : 'debug');

	// register all logging methods to jquery.
	$.each(['debug', 'info', 'warn', 'error'], function (index, value) {
		var origFn = $[value], fn = {};
		
		fn[value] = function (message) {
			var ret = log[value] && log[value].apply(log, arguments);
			return (origFn && origFn.apply(this, arguments)) || ret;
		};
		
		$.extend(fn);
	});
}($));
