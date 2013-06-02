/*jslint browser: true*/
/*global  $*/

(function ($) {
	// "use strict";
	var Keybarod = function () {};

	// register keyboard plugin.
	Keyboard.prototype= {
		options: {
		},

		activated: undefined,

		// capture keyboard.
		capture: function (plugin) {
			plugin && this.activated = plugin;
		},

		create: function () {
			var doc = $(document);
			doc.on('keypress', this.keypress);
			doc.on('keydown', this.keydown);
			doc.on('keyup', this.keyup);
		},

		keypress: function (event) {
			activated && activated.keypress && activated.keypress(event);
		},

		keydown: function (event) {
			activated && activated.keydown && activated.keydown(event);
		},

		keyup: function (event) {
			activated && activated.keyup && activated.keyup(event);
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
