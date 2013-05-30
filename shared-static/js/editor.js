
(function ($) {
	// "user strict";

	// Abstract template.
	var Template = function (regexp, triggerKeys) {
		var that = this;
		this.regexp = regexp;
		this.triggerKeys = [];
		if (triggerKeys && $.isArray(triggerKeys)) {
			$.each(triggerKeys, function () {
				that.triggerKeys.push(this);
			});
		}
	}, 
	// url template.
	UrlTemplate = function () {};

	// Template 
	Template.prototype = {
		trigger: function (key) {
			
		},
		// Test if given text matches template.
		test: function (text) {
			return this.regexp.test(text);
		},
		
		apply: function (text) {
			// return plain html.
			return '<a href="' + text + '" + >' + text + '</a>';
		}
	};


	// Url template prototype.
	UrlTemplate.prototype = {
		// supported prototypes.
		supportedPrototypes: ['http[s]', 'ftp', 'ssh', 'svn', 'git', 'mms', 'e2dk', 'thunder'],
		
		// url regular expression.
		urlRegExp: function () {
			return new RegExp('/(' + this.supportedPrototypes.join('|') + '):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/');
		}
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

		// Original

		createui: function () {
			this.templates['url'] = new UrlTemplate();
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
			this.selectstartDelegate = function (event) {
				return that.selectstart(event);
			};
			this.element.on('keydown', this.keydownDelegate);
			this.element.on('keypress', this.keypressDelegate);
			this.element.on('keyup', this.keyupDelegate);
			// this.element.on('selectionchange', this.selectstartDelegate);
		},

		destroyui: function () {
			// stub.
		},

		inputCharacter: function (ch) {
		},

		// Handle key down event.
		keypress: function (event) {
			var range, clone;
			// capture input by preventing event to bubble.
			// event.preventDefault();
			
			if (event.repeat) {
				
			}

			if (event.altKey || event.ctrlKey || event.metaKey) {
				// parse command.
			}

			if (event.key === this.keyCode.ESCAPE /* ESC */) {
				// handle Escape
				event.preventDefault();
			}

			// if (event.

			// this.normalizer.children('div').first().html(event.which);
			// $.debug('editor key pressed.');
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
			var tmpl, match, text, range;

			if (event.which === this.keyCode.DELETE || event.which === this.keyCode.BACKSPACE) {
				// Handle delete.
				range = window.getSelection().getRangeAt(0);
				if (range) {
					clone = range.cloneRange();
					clone.selectNode(range.startContainer);
					$.debug('result: ' + clone.toString());
					var link = document.createElement('a');
					link.href = 'example.com';
					link.appendChild(document.createTextNode('Example'));
					clone.insertNode(link);
				}
			}

			// $.each(this.templates, function (prop, value) {
			// 	match = value.test();
			// });
		}
	});
}($));
