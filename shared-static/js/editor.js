
(function ($) {
	// "user strict";

	// register editor plugin.
	$.ui('editor', {
		options: {
			delay: 100, // key down repeat delay, default 100 miliseconds.
			capture: true, // capture keyboard by default.
		},

		delayMet: false,

		// key down timer.
		timer: undefined,

		createui: function () {
			this.editor = this.element.find('.editor');
		},

		initui: function () {
			// stub.
			this.element.on('focus', this.focused);
		},

		destroyui: function () {
			// stub.
		},

		focused: function () {
			this.element.on('keydown', this.keydown);
			this.element.on('keypress', this.keypress);
			this.element.on('keyup', this.keyup);
		},

		keypress: function (event) {
			
		},

		keydown: function (event) {
		},

		keyup: function (event) {
		}
	});
}($));
