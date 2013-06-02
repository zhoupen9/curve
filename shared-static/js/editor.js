
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
			delay: 3000,
			// capture keyboard by default.
			capture: true,
		},

		// templates.
		templates: {
		},

		// create dialog UI.
		createui: function () {
			this.templates['url'] = new UrlTemplate().create();
			// textarea to record input content and prepare for submit.
			this.content = this.element.parent().children('textarea');
			// normalized content saver.
			this.normalizer = this.element.siblings('div.editor-normalizer').first();
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
			this.inputDelegate = function (event) {
				return that.input(event);
			};
			// this.element.on('keydown', this.keydownDelegate);
			// this.element.on('keypress', this.keypressDelegate);
			// this.element.on('keyup', this.keyupDelegate);
			this.element.on('input', this.inputDelegate);
		},

		destroyui: function () {
			// stub.
		},

		inputCharacter: function (ch) {
			
		},

		// handle contenteditable input event.
		input: function (event) {
			var elem = event.target;
			if (!this.element.children().length) {
				// This little trick will ensure user's editing will be from within a '<div>' element.
				$('<div><br/></div>').appendTo(this.element);
				return;
			}
			// parse all div inside editor.
			this.element.children('div').each(function () {
				
			});
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
			var that = this, key = event.which,
			text = this.content.html();

			this.element.children().each(function () {
				var nodes = this.childNodes();
				if (nodes && nodes.length) {
					$.each(nodes, function () {
						$.debug(this.nodeValue);
					});
				}
				// $.debug('child: ' + this.get);
			});
		},

		// handle key up, Check if text input contains any content matches any
		// predefined templates. And apply matched templates to the content.
		keyup: function (event) {
			// var that = this, nodes, tmpl,
			// selection = window.getSelection(),
			// range = selection.getRangeAt(0),
			// edit = range.cloneRange();
			
			// if (!range) {
			// 	return;
			// }

			
			// edit = range.cloneRange();
			// edit.selectNode(range.startContainer);
			// text = edit.toString();

			// $.each(this.templates, function (prop, template) {
			// 	if (template.test(text)) {
			// 		// clone a tmplate range to apply.
			// 		tmpl = range.cloneRange();
			// 		tmpl.selectNode(range.startContainer);
			// 		nodes = template.apply(tmpl.toString()).reverse();

			// 		// delete original content selected by edit.
			// 		edit.deleteContents();

			// 		// insert template results.
			// 		$.each(nodes, function () {
			// 			tmpl.insertNode(this);
			// 		});

			// 		// move cursor to content end position.
			// 		if (selection.removeAllRanges) {
			// 			selection.removeAllRanges();
			// 		} else if (selection.empty) {
			// 			selection.empty();
			// 		}
			// 		// collapse range to set cursor at end of ange.
			// 		tmpl.collapse(false);
			// 		selection.addRange(tmpl);
			// 	}
			// });
		}
	});
}($));
