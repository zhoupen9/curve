/*jslint browser: true*/
/*global $*/

(function ($) {
	// "use strict";

	// Base plugin.
	// Plugin is an abstraction for dynmatically add/modify/remove functionalities.
	var Plugin = function () {};

	// Define Plugin prototype.
	// All sub plugins will inherite this prototype as default features.
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
		destory: $.noop,

		// Create new plugin.
		// Core plugin registration process invovles
		// 1. add a selector for target element by ':pluginname';
		// 2. create a prototype constructor to inherit plugin base.
		// 3. invoke constructor to create plugin object and save this object
		//    in jquery element's data[pluginname], if jquery's element call
		//    extended function (which create after) first time.
		// 4. invoke plugin's init funciton if jquery's element call extended
		//    function different than first time (by checking if plugin object
		//    was created in step 3).
		// @param name plugin name.
		// @param base base plugin type or base plugin object.
		// @param proto plugin prototype.
		plugin: function (name, base, proto) {
			var Constructor, proxyPrototype = {}, fullname, namespace, array;
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

			// support two parameters.
			// If caller only provides two parameters, created plugin has a
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
			Constructor = function (collection, options, elem) {
				if (!this.create) {
					return new constructor(collection, options, elem);
				}
				// ensure constructor called with arguments.
				if (arguments.length) {
					// When creating plugin, if options were set, instead of modify on prototype's
					// options, simplely attach those options to the instance, so options will
					// only apply to the instance.
					$.extend(this.options, options);
					// call abstract create method.
					// if plugin does not implements abstract methods defined in Plugin.prototype,
					// it will invoke the default methods, and do nothing.
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
			Constructor.prototype = $.extend({}, base, proxyPrototype);

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
						$.debug('call constructor for: ' + name + '.');
						$.data(this, name, new Constructor(that, options, this));
					}
				});
				return that;
			}
		}
	}

	// UI base plugin.
	// UI is declared from within an announymous function, so that it can NOT be accessed
	// directly outside of this function scope.	
	var UI = function () {};

	// extends from base, Plugin.
	UI.prototype = $.extend({}, Plugin.prototype, {
		// plugin namespace.
		namespace: 'ui',

		// focusable selector.
		focusable: ['div[contenteditable=true]', 'input', 'button', 'a', 'textarea'],

		// Create ui.
		createui: $.noop,

		// destory ui.
		destroyui: $.noop,

		// initialize ui.
		initui: $.noop,

		// If ui is currently visible.
		visible: function () {
			return this.element ? this.element.css('display') !== 'none' : false;
		},

		// Create ui.
		create: function (collection, elem) {
			var that = this, callback;
			// introduce a reference to element's jquery object.
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
			// Due to composite ui plugins will cause call on non existed method,
			// here cancel initui() call until figure it out.
			this.initui();
		},

		destroy: function () {
			this.destroyui();
		}
	});

	// Define frequntly used keys.
	$.extend(UI.prototype, {
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

	// declare curve object.
	var Curve = function () {
		this.settings = {
			debug: false
		};
	};

	// Cureve prototype.
	Curve.prototype = {
		// settings.
		options: {
			logging: {
				level: 'debug'
			}
		},

		// all managed plugins.
		plugins: [],

		// all managed UIs.
		uis: [],

		// update settings.
		setting: function (prop, value) {
			if (!value) {
				return this.options[prop];
			}
			if (!$.isFunction(value)) {
				this.options[prop] = value;
			}
		},

		// Get curve settings or update curve settings.
		// @param options plain object.
		settings: function (options) {
			var that = this;

			if (!options) {
				// support getting options when no parameters given.
				return this.options;
			}
			
			if (options) {
				$.each(options, function (prop, vlaue) {
					this.setting(prop, value);
				});
			}
		},

		// Register a new plugin.
		// New registered plugin's name (not fullname, e.g. fullname is 'ui.dialog' then
		// name should be 'dialog') will extend an associated jquery function to plugin
		// functionalities to target element (mostly this).
		// E.g. call $('#some_id').dilaog(); after registered 'ui.dialog' plugin, will
		// apply Plugin.plugin(name, new Plugin() /* which is default. */, proto).
		plugin: function (name, proto) {
			var plugin = new Plugin();
			$.debugg('Register plugin: ' + name + '.');
			plugin.plugin(name, proto);
			this.plugins.push(plugin);
		},

		// Shortcut for register an UI plugin which has a parent class UI.
		ui: function (name, proto)	{
			var ui = new UI(), fullname = ui.namespace.concat('.').concat(name);
			$.debug('Register ui plugin: ' + fullname + '.');
			ui.plugin(fullname, ui, proto);
			this.uis.push(ui);
		}
	};

	$.curve = new Curve();
}($));
