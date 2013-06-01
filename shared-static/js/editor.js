
(function ($) {
	// "user strict";

	// Abstract template.
	var
	Template = function () {},
	// url template.
	UrlTemplate = function () {},

	Clickable = function () {};

	Clickable.prototype = {
		protocols: {
			at: '@',
			hashTag: '#',
			tag: '#',
			list: '#',
			link: 'link'
		},

		output: function (protocol, data) {
			var html;
			switch (protocol) {
			case this.protocols.at:
				// output a link to user dialog.
				html = '<a data-user="' + data + '">' + data + '</a>';
				break;
			case this.protocols.hashTag:
				// output a link to user dialog.
				html = '<a data-user="' + data + '">' + data + '</a>';
				break;
			case this.protocols.tag:
				// output a link to tag module.
				html = '<a href="/tag/' + data + '">' + data + '</a>';
				break;
			case this.protocols.list:
				// output a link to list module.
				html = '<a href="/list/' + data + '">' + data + '</a>';
				break;
			case this.protocols.link:
				// output a regular link.
				html = '<a href="' + data + '">' + data + '</a>';
				break;
			default:
				break;
			}
			return html;
		}
	};

	// Template
	Template.prototype = {
		// All templates' type.
		type: 'template',

		// create template.
		_create: function (regexp, triggerKeys) {
			var that = this;
			this.regexp = regexp;
			this.triggerKeys = [];
			if (triggerKeys && $.isArray(triggerKeys)) {
				$.each(triggerKeys, function () {
					that.triggerKeys.push(this);
				});
			}
			return this;
		},

		// Test if given text matches template.
		test: function (key, text) {
			var test = this.regexp.test(text);
			return test;//this.triggerKeys.indexOf(key) != -1 &&	this.regexp.test(text);
		},

		// create template.
		create: $.noop,

		// initialize template.
		init: $.noop,

		// apply template to text.
		apply: $.noop
	};

	// Url template prototype.
	// Url template replaces supported format from plain text to a html link.
	UrlTemplate.prototype = $.extend({}, Template.prototype, {
		clickable: 'link',

		triggerKeys: [
			// BACKSPACE
			8,
			// WHITESPCE
			32,
			// DELETE
			46,
		],

		// supported prototypes.
		supportedProtocols: ['http[s]', 'ftp', 'ssh', 'svn', 'git', 'mms', 'e2dk', 'thunder'],

		// create template.
		create: function () {
			// var regexp = new RegExp('/(' + this.supportedProtocols.join('|') + ')(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/');
			var regexp = new RegExp('((' + this.supportedProtocols.join('|') + '):\/\/)?(?:\\w+:\\w+@)?((?:[\\w]+)(?:\\.[\\w-]+)+)(:[0-9]+)?(\\/[\\w#!:.?+=&%@!\\-\\/]+)');
			return this._create(regexp, this.triggerKeys);
		},

		// Apply template to text and return replaced text.
		apply: function (range) {
			var text =range.toString(), clickable, match = this.regexp.exec(text), matched, index, nodes = [];
			if (!match) {
				return;
			}
			matched = match[0];
			index = text.indexOf(matched);
			if (index > 0) {
				nodes.push(document.createTextNode(text.substring(0, index)));
			}
			clickable = new Clickable();
			nodes.push(clickable.output(this.clickable, matched));
			if (index + matched.length < text.length) {
				nodes.push(document.createTextNode(text.substring(index + matched.length, text.length - 1)));
			}
			return nodes;
		}
	});

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

		templateKeys: [ '@', 8, 32, 46 ],

		createui: function () {
			this.templates['url'] = new UrlTemplate().create();
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
			var that = this, text, range, key = event.which;

			if (key === this.keyCode.DELETE || key === this.keyCode.BACKSPACE) {
			}

			if (this.templateKeys.indexOf(key) != -1) {
				range = window.getSelection().getRangeAt(0);
				if (!range) {
					return;
				}
				clone = range.cloneRange();
				clone.selectNode(range.startContainer);
				text = clone.toString();

				$.each(this.templates, function (prop, template) {
					if (template.test(key, text)) {
						clone.deleteContents();
						text = template.apply(text);
						var ins = document.createTextNode(text);
						clone.insertNode(ins);
						// $(range.startContainer).html(text);
						// range.startContainer.innerHTML = text;
					}
				});
			}
		}
	});
}($));
