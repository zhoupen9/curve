
(function ($) {
	// "user strict";

	// Abstract template.
	var Template = function (regexp) {
		this.regexp = regexp;
	};

	// Template 
	Template.prototype = {
		// Test if given text matches template.
		test: function (text) {
			return this.regexp.test(text);
		},
		
		apply: function (text) {
			// return plain html.
			return '<a href="' + text + '" + >' + text + '</a>';
		}
	};

	// url template.
	var UrlTemplate = function () {};

	// Url template prototype.
	UrlTemplate.prototype = {
		// supported prototypes.
		supportedPrototypes: ['http[s]', 'ftp', 'ssh', 'svn', 'git', 'mms', 'e2dk', 'thunder'],
		
		// url regular expression.
		urlRegExp: new RegExp('/(' + supportedPrototypes.join('|') + '):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/'),
	};

	$.extend(UrlTemplate.prototype, Template.prototype);

	// register editor plugin.
	$.curve.ui('editor', {
		// editor options.
		options: {
			// key down repeat delay, default 100 miliseconds.
			delay: 100,
			// capture keyboard by default.
			capture: true,
		},

		// templates.
		templates: {
			url: new UrlTemplate()
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
			// capture input by preventing event to bubble.
			event.preventDefault();
			
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
		
		// handle key up, Check if text input contains any content matches any
		// predefined templates. And apply matched templates to the content.
		keyup: function (event) {
			var tmpl, match, text;

			text = this.element.html();

			$.each(this.templates, function (prop, value) {
				match = value.test();
			});
		}
	});
}($));
