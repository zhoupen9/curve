/*jslint browser: true*/
/*global  $*/

(function ($) {
    "use strict";
    
    $.ui = $.ui || {};
    
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
        },
        
        add: function (name, proto) {
            return this;
        }
    });

    // Add plugin to Jquery.
    $.Plugin = $.Plugin || {};

    // Define Plugin prototype.
    $.Plugin.prototype = {
        name: 'plugin',
        version: '0.1',

	// Plugin override this method to create.
        create: $.noop,

	// Plugin override this method to initialize.
        init: $.noop,

	// Plugin override this method to destroy anything if need to destory.
        destory: $.noop,

	// create plugin.
	createPlugin: function (options, elem) {
	    this.create(options, elem);
	    this.init(options, elem);
	},
    };

    // create new plugin.
    $.plugin = function (name, proto) {
	var constructor, proxyPrototype = {};
	if (!name) {
	    return $.error("Plugin must declare a name.");
	}
	
	// // check if plugin with name already exists.
	// if (this.plugins[name]) {
	//     return this.plugins[name];
	// }

	// create new constructor for plugin.
        constructor = function (options, elem) {
	    if (!this.createPlugin) {
                return new constructor(options, elem);
	    }
	    if (arguments.length) {
                this.createPlugin(options, elem);
	    }
        };

	// copy prototype to proxy prototype.
        $.each(proto, function (prop, value) {
	    if (!$.isFunction(value)) {
                proxyPrototype[prop] = value;
	    } else {
                proxyPrototype[prop] = (function () {
		    var retValue;
		    retValue = value.apply(this, arguments);
		    return retValue;
		});
	    }
        });

	// create construtor's prototype using proxy prototype.
	constructor.prototype = $.extend($.Plugin.prototype, proxyPrototype);

	// create bridge to Jquery.
	$.fn[name] = function (options) {
	    var retValue = this;

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
