/*jslint browser: true*/
/*global $*/

// jquery base plugin.
(function ($) {
	"use strict";

	// Add plugin to Jquery.
	$.Plugin = $.Plugin || {};

	// Define Plugin prototype.
	$.Plugin.prototype = {
		name: 'plugin',
		version: '0.1',
		options: {},

		// Plugin override this method to create.
		create: $.noop,

		// Plugin override this method to initialize.
		init: $.noop,

		// Plugin override this method to destroy anything if need to destory.
		destory: $.noop
	};

	// create new plugin.
	// @param name plugin name.
	// @param proto plugin prototype.
	$.plugin = function (name, base, proto) {
		var constructor, basePrototype, proxyPrototype = {}, fullname = name.split('.')[0];
		if (!name) {
			return $.error("Plugin must declare a name.");
		}

		name = name.split('.')[1];

		if (!proto) {
			proto = base;
			base = $.ui;
		}

		basePrototype = new base();
		// create new constructor for plugin.
		constructor = function (options, elem) {
			if (!this.create) {
				return new constructor(options, elem);
			}
			// ensure constructor called with arguments.
			if (arguments.length) {
				this.create(options, elem);
			}
		};

		// copy prototype to proxy prototype.
		$.each(proto, function (prop, value) {
			if (!$.isFunction(value)) {
				proxyPrototype[prop] = value;
			} else {
				// If constructor's prototype's entry is a function,
				proxyPrototype[prop] = function () {
					return value.apply(this, arguments);
				};
			}
		});

		// create construtor's prototype using proxy prototype.
		constructor.prototype = $.extend({}, $.Plugin.prototype, basePrototype, proxyPrototype);

		// create bridge to Jquery.
		$.fn[name] = function (options) {
			var retValue = this, plugin;

			this.each(function () {
				var instance = $.data(this, name);
				if (instance) {
					instance.init();
				} else {
					$.data(this, name, new constructor(options, this));
				}
			});
			return retValue;
		}
	};
}($));


// UI plugin.
(function ($) {
	// define ui in jquery.
	$.ui = function () {};

	$.extend($.ui, {
		version: '0.1',
		children: [],
		keyCode: {
			BACKSPACE: 8,
			COMMA: 188,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			LEFT: 37,
			NUMPAD_ADD: 107,
			NUMPAD_DECIMAL: 110,
			NUMPAD_DIVIDE: 111,
			NUMPAD_ENTER: 108,
			NUMPAD_MULTIPLY: 106,
			NUMPAD_SUBTRACT: 109,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SPACE: 32,
			TAB: 9,
			UP: 38
		}
	});

	$.ui.prototype = {
		options: {},
		element: undefined,
		namespace: 'ui',

		// Create ui.
		createui: $.noop,

		// destory ui.
		destroyui: $.noop,

		// show callbacks.
		showCallbacks: $.Callbacks(),

		visible: function () {
			if (!this.element) {
				return false;
			}
			return this.element.css('display') !== 'none';
		},

		// Create ui.
		create: function (options, elem) {
			$.extend(this, options);
			this.element = $(elem);
			this.createui();
			this.initui();

			// create show hook.
			if (this.show) {
				this.showCallbacks.add(this.show);
			}

			this.origShow = this.element.show;
			this.element.show = function () {
				if (!this.visible()) {
					$.show.apply(this, arguements);
					return that.showCallbacks.fire();
				}
				return this;
			};
		},

		init: function () {
			this.initui();
		},

		destroy: function () {
			this.destroyui();
		}
	};

	$.ui.plugin = function (name, proto)  {
		var fullname = $.ui.prototype.namespace.concat('.').concat(name);
		$.log.debug('Register ui plugin: ' + name + '.');
		$.plugin(fullname, $.ui, proto);
		// console.log($.ui.prototype.namespace);
	};

}($));

// global curve object.
(function ($) {
	// declare curve object.
	$.Curve = function () {};

	// 
	$.Curve.prototype = {
		settings: {
			debug: true,
		},

		// update settings.
		setting: function (prop, value) {
			if (!value) {
				return this.settings[prop];
			}
			if (!$.isFunction(value)) {
				this.settings[prop] = value;
			}
		}
	};

	$.fn.curve = function (options) {
		$.curve = $.curve || new $.Curve();
		if (options) {
			$.each(options, function (prop, vlaue) {
				$.curve.setting(prop, value);
			});
		}
	};
}($));
