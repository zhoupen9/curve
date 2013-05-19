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
    
    $.plugin = $.plugin || {};
    
    $.Plugin = function () {};
    
    $.Plugin.prototype = {
        name: 'plugin',
        version: '0.1',
        create: $.noop,
        init: $.noop,
        destory: $.noop
    };
    
    $.Plugin.plugin = function (name, proto) {
        var Constructor = $.fn[name] = function (options, elem) {
            if (!this.create) {
                return new Constructor(options, elem);
            }
            if (arguments.length) {
                return this.create(arguments);
            }
        };
        
        $.each(proto, function (prop, value) {
            if (!$.isFunction(value)) {
                this[prop] = value;
            } else {
                
            }
        });
    };
}($));
