/*jslint browser: true*/
/*global $*/

(function ($) {
	// "use strict";

	// Base plugin.
	var Plugin = function () {};

	// Define Plugin prototype.
	Plugin.prototype = {
		// plugin name.
		name: 'plugin',
		// plugin version.
		version: '0.1',
		// plugin options.
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
	// @param base base plugin type or base plugin object.
	// @param proto plugin prototype.
	$.plugin = function (name, base, proto) {
		var constructor, proxyPrototype = {}, fullname, namespace, array;
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return $.error("Plugin must declare a name(string).");
		}
		// namesapce, fullname and name.
		array = name.split('.');
		namespace = array.length > 1 ? array[0] : 'plugin';
		name = array[array.length - 1];
		fullname = namespace + '-' + name;

		// create selector for plugin.
		$.expr[':'][fullname.toLowerCase()] = function (elem) {
			return !!$.data(elem, fullname);
		}

		// support two parameters. In this case, created plugin has a
		// default parent which is Plugin.
		if (!proto) {
			proto = base;
			base = Plugin;
		}

		if ($.isFunction(base) || typeof base !== 'object') {
			base = new base();
		}

		// create new constructor for plugin.
		// Plugin subclass's constructor need a collection returned by
		// jquery selectors as first parameter to create hooks.
		// @param collection collection returned by jquery selectors.
		// @param plugin user options.
		// @param elem jquery element.
		constructor = function (collection, options, elem) {
			if (!this.create) {
				return new constructor(collection, options, elem);
			}
			// ensure constructor called with arguments.
			if (arguments.length) {
				$.extend(this, options);
				this.create(collection, elem);
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
		constructor.prototype = $.extend({}, base, proxyPrototype);

		// create bridge to jquery, because Jquery('selector') always return a collection,
		// plugin system need to hack into this collection to create hooks, so here pass this
		// collection to plugin's constructor if plugin was called via jquery's selectors.
		$.fn[name] = function (options) {
			var that = this, plugin;

			this.each(function () {
				var instance = $.data(this, name);
				if (instance) {
					instance.init(that);
				} else {
					$.data(this, name, new constructor(that, options, this));
				}
			});
			return that;
		}
	};
}($));


// UI plugin.
(function ($) {
	// define ui in jquery.
	var UI = function () {};

	// extends from base, Plugin.
	UI.prototype = $.extend({}, Plugin.prototype, {
		// ui's optins.
		options: {},

		// plugin namespace.
		namespace: 'ui',

		// ui's jquery object.
		element: undefined,

		// Create ui.
		createui: $.noop,

		// destory ui.
		destroyui: $.noop,

		// If ui is currently visible.
		visible: function () {
			return this.element ? this.element.css('display') !== 'none' : false;
		},

		// Create ui.
		create: function (collection, elem) {
			var that = this, callback;
			// save a reference to element's jquery object.
			this.element = $(elem);

			// create ui.
			this.createui();

			// If plugin extends ui has a show method, add it to callbacks.
			if (this.show) {
				callback = function () {
					return that.show();
				};
				// instance show callbacks.
				this.showCallbacks = $.Callbacks(),
				this.showCallbacks.add(callback);
			}
			// initialzie ui.
			this.init(collection);
		},

		// Initialize ui.
		// @param collection collection returned by jquery selectors.
		init: function (collection) {
			var that = this;
			// Hack into jquery to setup hooks.
			this.origShow = collection.show;
			collection.show = function () {
				if (!that.visible()) {
					// call original show.
					that.origShow.apply(collection, arguments);
					that.showCallbacks && that.showCallbacks.fire();
				}
				return collection;
			};
			this.initui();
		},

		destroy: function () {
			this.destroyui();
		}
	});

	$.extend(UI, {
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

	// Shortcut for register an UI plugin which has a parent class UI.
	$.ui = function (name, proto)  {
		var ui = new UI(), fullname = ui.namespace.concat('.').concat(name);
		$.debug('Register ui plugin: ' + fullname + '.');
		$.plugin(fullname, ui, proto);
	};
}($));

(function ($) {
	// declare curve object.
	var Curve = function () {
		this.settings = {
			debug: true
		};
	};

	// Cureve prototype.
	Curve.prototype = {
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
		var curve = new Curve();
		if (options) {
			$.each(options, function (prop, vlaue) {
				curve.setting(prop, value);
			});
		}
	};
}($));
