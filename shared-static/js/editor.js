
(function ($) {
	// "user strict";

	// register editor plugin.
	$.curve.ui('editor', {
		// editor options.
		options: {
			// key down repeat delay, default 100 miliseconds.
			delay: 100,
			// capture keyboard by default.
			capture: true,
		},

		delayMet: false,

		// key down timer.
		timer: undefined,

		normalizer: undefined,

		typeahead: undefined,

		display: undefined,

		createui: function () {
			this.editor = this.element.find('.editor');
			this.display = this.editor.children(":first");
			this.normalizer = this.element.find('.editor-normalizer').children(":first");
		},

		initui: function () {
			// stub.
			this.element.on('focus', this.focused);
			this.element.focus();
		},

		destroyui: function () {
			// stub.
		},

		focused: function () {
			this.element.on('keydown', this.keydown);
			this.element.on('keypress', this.keypress);
			this.element.on('keyup', this.keyup);
		},

		// Handle key down event.
		keypress: function (event) {
			if (event.repeat) {
			}

			if (event.altKey || event.ctrlKey || event.metaKey) {
				// parse command.
			}

			if (event.key == 0x1b /* ESC */) {
				// handle Escape
			}

			var html = this.display.html();
			html = html.concat(event.which);
			this.display.html(html);

			this.normalizer.html(html);
		},

		// Handle key down event.
		keydown: function (event) {
			var that = this;
			if (!delayMet) {
				setTimeout(function () {
					that.delayMet = true;
				}, this.delay);
				return;
			}
			this.keypress(event);
			event.preventDefault();
		},

		keyup: function (event) {
		}
	});
}($));
