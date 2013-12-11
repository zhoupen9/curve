/*jslint browser: true*/
/*global  $*/

(function ($) {
	"use strict";
	var Keyboard = function () {};

	// register keyboard plugin.
	Keyboard.prototype = {
		options: {
		},

		activated: undefined,

		// capture keyboard.
		capture: function (plugin) {
            if (plugin) {
                this.activated = plugin;
            }
		},

		create: function () {
			var doc = $(document);
			doc.on('keypress', this.keypress);
			doc.on('keydown', this.keydown);
			doc.on('keyup', this.keyup);
		},

		keypress: function (event) {
			if (this.activated && this.activated.keypress) {
                this.activated.keypress(event);
            }
		},

		keydown: function (event) {
			if (this.activated && this.activated.keydown) {
                this.activated.keydown(event);
            }
		},

		keyup: function (event) {
			if (this.activated && this.activated.keyup) {
                this.activated.keyup(event);
            }
		},

		init: function () {
		},

		destroy: function () {
		}
	};

	// create keyboard manager.
	// $.kbdmanager = $.kbdmanager || new Keyboard();
	// $.kbdmanager.create();
	
}($));
