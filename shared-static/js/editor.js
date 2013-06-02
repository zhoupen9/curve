
(function ($) {
	// "user strict";

	// Abstract template.
	var
	Template = function () {},
	// url template.
	UrlTemplate = function () {},
	// '@' template.
	AtTemplate = function () {},
	// '#' list
	ListTemplate = function () {},
	// Clickable.
	Visual = function () {};

	Visual.prototype = {
		protocols: {
			at: '@',
			hashTag: '#',
			tag: '#',
			list: '#',
			link: 'link'
		},

		// Create html node according to protocol and user data.
		create: function (protocol, data) {
			var node;
			switch (protocol) {
			case this.protocols.at:
				// create a link to user dialog.
				node = document.createElement('a');
				node.setAttribute('data-user', data);
				node.appendChild(document.createTextNode(data));
				break;
			case this.protocols.hashTag:
				// create a link to user dialog.
				node = document.createElement('a');
				node.setAttribute('data-user', data);
				node.appendChild(document.createTextNode(data));
				break;
			case this.protocols.tag:
				// create a link to tag module.
				node = document.createElement('a');
				node.setAttribute('href', '/tag/' + data);
				node.appendChild(document.createTextNode(data));
				break;
			case this.protocols.list:
				// create a link to list module.
				node = document.createElement('a');
				node.setAttribute('href', '/list/' + data);
				node.appendChild(document.createTextNode(data));
				break;
			case this.protocols.link:
				// create a regular link.
				node = document.createElement('a');
				node.setAttribute('href', data);
				node.appendChild(document.createTextNode(data));
				break;
			default:
				node = document.createTextNode(data);
				break;
			}
			return node;
		}
	};

	// Template
	Template.prototype = {
		// All templates' type.
		type: 'template',

		// create template.
		_create: function (regexp) {
			this.regexp = regexp;
			return this;
		},

		// Test if given text matches template.
		test: function (text) {
			return this.regexp.test(text);
		},
		
		// eliminate whitespace.
		createTextNode: function (text) {
			if (text && text === ' ') {
				text = '&nbsp;';
			}
			return document.createTextNode(text);
		},

		// create template.
		create: $.noop,

		// initialize template.
		init: $.noop,

		// Process text and return matched text.
		process: $.noop,

		// apply template to text.
		apply: function (range) {
			var node, visual, text = range.toString(),  match = this.regexp.exec(text), matched, index, nodes = [];
			if (!match) {
				return;
			}
			matched = match[0];
			index = text.indexOf(matched);
			if (index > 0) {
				node = this.createTextNode(text.substring(0, index));
				nodes.push(node);
			}
			visual = new Visual();
			nodes.push(visual.create(this.visual, matched));
			if (index + matched.length < text.length) {
				node = this.createTextNode(text.substring(index + matched.length, text.length));
				nodes.push(node);
			}
			return nodes;
		}
	};

	// Url template prototype.
	// Url template replaces supported format from plain text to a html link.
	UrlTemplate.prototype = $.extend({}, Template.prototype, {
		// default url visual, web link.
		visual: 'link',

		// supported prototypes.
		supportedProtocols: ['http[s]', 'ftp', 'ssh', 'svn', 'git', 'mms', 'e2dk', 'thunder'],

		// create template.
		create: function () {
			var regexp = new RegExp('((' + this.supportedProtocols.join('|') + '):\/\/)?(?:\\w+:\\w+@)?((?:[\\w]+)(?:\\.[\\w-]+)+)(:[0-9]+)?(\\/[\\w#!:.?+=&%@!\\-\\/]+)');
			return this._create(regexp, this.triggerKeys);
		},

		// Apply template to text and return replaced text.
		apply: function (text) {
			var node, visual, match = this.regexp.exec(text), matched, index, nodes = [];
			if (!match) {
				return;
			}
			matched = match[0];
			index = text.indexOf(matched);
			if (index > 0) {
				node = this.createTextNode(text.substring(0, index));
				nodes.push(node);
			}
			visual = new Visual();
			nodes.push(visual.create(this.visual, matched));
			if (index + matched.length < text.length) {
				node = this.createTextNode(text.substring(index + matched.length, text.length));
				nodes.push(node);
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

		// create dialog UI.
		createui: function () {
			this.templates['url'] = new UrlTemplate().create();
			this.display = this.element.children(':first');
			this.normalizer = this.element.siblings('div.editor-normalizer').first();
			$.debug('display:' + this.display.length + ', normalizer:' + this.normalizer.length);
		},

		// initialize dialog UI.
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
			var that = this, nodes, tmpl,
			selection = window.getSelection(),
			range = selection.getRangeAt(0),
			edit = range.cloneRange();
			
			if (!range) {
				return;
			}

			
			edit = range.cloneRange();
			edit.selectNode(range.startContainer);
			text = edit.toString();

			$.each(this.templates, function (prop, template) {
				if (template.test(text)) {
					// clone a tmplate range to apply.
					tmpl = range.cloneRange();
					tmpl.selectNode(range.startContainer);
					nodes = template.apply(tmpl.toString()).reverse();

					// delete original content selected by edit.
					edit.deleteContents();

					// insert template results.
					$.each(nodes, function () {
						tmpl.insertNode(this);
					});

					// move cursor to content end position.
					if (selection.removeAllRanges) {
						selection.removeAllRanges();
					} else if (selection.empty) {
						selection.empty();
					}
					// collapse range to set cursor at end of ange.
					tmpl.collapse(false);
					selection.addRange(tmpl);
				}
			});
		}
	});
}($));
