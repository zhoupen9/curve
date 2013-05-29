
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

		// If editor's delay met.
		delayMet: false,

		// key down timer.
		timer: undefined,

		// normalized content saver.
		normalizer: undefined,

		// typeahead for content.
		typeahead: undefined,

		// content display.
		display: undefined,

		createui: function () {
			this.display = this.element.children(':first');
			// this.normalizer = this.element.parent().children('div.editor-normalizer').first();
			this.normalizer = this.element.siblings('div.editor-normalizer').first();
			$.debug('display:' + this.display.length + ', normalizer:' + this.normalizer.length);
			// When editor created or activated, it need to register focus handler.
		},

		initui: function () {
			var that = this;
			this.keydownDelegate = function (event) {
				return that.keydown(event);
			};
			this.keypressDelegate = function (event) {
				return that.keypress(event);
			};
			this.keyupDelegate = function (event) {
				return that.keyup(event);
			};
			this.element.on('keydown', this.keydownDelegate);
			this.element.on('keypress', this.keypressDelegate);
			this.element.on('keyup', this.keyupDelegate);
		},

		destroyui: function () {
			// stub.
		},

		inputCharacter: function (ch) {
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
				event.preventDefault();
			}

			this.normalizer.children('div').first().html(event.which);

			$.debug('editor key pressed.');
		},

		// Handle key down event.
		keydown: function (event) {
			var that = this;
			if (!this.delayMet) {
				setTimeout(function () {
					that.delayMet = true;
				}, this.delay);
				return;
			}
			this.keypress(event);
			// event.preventDefault();
		},

		keyup: function (event) {
		}
	});
}($));
