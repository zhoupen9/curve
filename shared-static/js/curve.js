/*jslint browser: true*/
/*global $*/

/*
 * jquery base plugin.
 */
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

    /*
     * create new plugin.
     * @name plugin name.
     * @proto plugin prototype.
     */
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
	constructor.prototype = $.extend($.Plugin.prototype, basePrototype, proxyPrototype);

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

/* 
 * UI plugin.
 */
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

	/* Create ui. */
	createui: $.noop,

	/* destory ui. */
	destroyui: $.noop,

	/* Create ui. */
	create: function (options, elem) {
	    $.extend(this.options, options);
	    this.element = $(elem);
	    this.createui();
	    this.initui();
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
	$.plugin(fullname, $.ui, proto);
	// console.log($.ui.prototype.namespace);
    };

}($));
