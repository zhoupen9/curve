
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
	// Formatter.
	Formatter = function () {};

	Formatter.prototype = {
		protocols: {
			at: '@',
			hashTag: '#',
			tag: '#',
			list: '#',
			link: 'link'
		},

		format: function (protocol, data) {
			switch (protocol) {
			case this.protocols.link:
				return '<a href="' + data + '">' + data + '</a>';
			}
			return null;
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
			visual = new Formatter();
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
		protocol: 'link',

		// supported prototypes.
		supportedProtocols: ['http[s]', 'ftp', 'ssh', 'svn', 'git', 'mms', 'e2dk', 'thunder'],

		// create template.
		create: function () {
			var regexp = new RegExp('((' + this.supportedProtocols.join('|') + '):\/\/)?(?:\\w+:\\w+@)?((?:[\\w]+)(?:\\.[\\w-]+)+)(:[0-9]+)?(\\/[\\w#!:.?+=&%@!\\-\\/]+)');
			return this._create(regexp, this.triggerKeys);
		},

		// Apply template to text and return replaced text.
		apply: function (text) {
			var match = this.regexp.exec(text);
			return match ? new Formatter().format(this.protocol, text) : null;
		}
	});

	// register editor plugin.
	// This editor provides additional content editing features than textarea,
	// 1. Popup suggestions.
	//    When user input any predefined keywords, such as '@', '#', a dropdown
	//    menu will popup and provides serveral suggestions.
	// 2. URL, mention, tag will automatically transfer into a nicer format.
	// 3. Use URL shorten service to shorten given url regardless it was typed in
	//    or paste in.
	// 4. Attach an imamge/audio/video into editor will automatically transfer them
	//    into a link to uploaded URL.
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

		// Handle contenteditable input event.
		// Editor plugin handles every input event fired from within associated contenteditable
		// 'div' element. It's important to know that edit plugin ensures that every single line
		// in content will be enclosed by a 'div' element. When input event triggered, plugin
		// checks source 'div' elements' content (meaning every div as a single line), and parse it into
		// a display form via employee a couple of template parser.
		// This parsing processes act like lexical parser, each segment passing to parser can NOT
		// be ambiguous, and each segment can only produce one and only one result.
		// So template parsers work in a monopoly manner, instead of in a filter chain manner.
		input: function (event) {
			var i, selection, range, node, value, values, rm = [], out = '', child,
			newnode = null, offset, pos, matched, regexp = /(\s+)/, created = [];
			
			if (!this.element.children().length) {
				// This little trick ensures that user's editing comes from within a '<div>' element.
				$('<div><br/></div>').appendTo(this.element);
				return;
			}

			// if browser does not support selection, return to remain content unmodified.
			if (!window.getSelection) {
				return;
			}
			
			selection = window.getSelection();
			range = selection.getRangeAt(0);
			node = selection.anchorNode.nodeType == 3 ? selection.anchorNode.parentNode : selection.anchorNode;
			offset = range.endOffset;

			for (i = 0; i < node.childNodes.length; i++) {
				child = node.childNodes[i];
				if (child.nodeType == 3) {
					// text node.
					out = '';
					values = child.nodeValue.split(regexp);
					for (value in values) {
						$.each(this.templates, function (prop, tmpl) {
							newnode = tmpl.apply(values[value]);
							return newnode == null;
						});
						out += newnode ? newnode : (values[value] === ' ' ? '&nbsp;' : values[value]);
					}
					created.push(out);
				} else if (child.nodeType == 1) {
					// element.
					if (child.innerHTML) {
						child.setAttribute('href', child.innerHTML);
					}
					created.push(child.outerHTML);
				}
			}

			if (created.length) {
				node.innerHTML = created.join('');
			}
			// div.innerHTML = out;
			// //
			// selection.removeAllRanges && selection.removeAllRanges();
			// selection.empty && selection.empty();
			
			// pos = document.createRange();
			// pos.selectNode(div.lastChild);
			// // pos.setStart(div, 0);
			// // pos.setEnd(div, div.childNodes.length);
			// pos.collapse(false);
			// selection.addRange(pos);

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
