/*jslint browser: true*/
/*global  $*/

(function ($) {
	// "use strict";

	// Dialog ui.
	$.curve.ui('dialog', {
		// name.
		name: 'dialog',

		// dialog close class name.
		closeCls: 'dialog-close',

		// dialog overlay class name.
		overlayCls: 'modal-overlay',

		// default behavior.
		modal: true,

		// default dialog options.
		options: {
			// default keyboard behavior.
			captureKeys: true,
			// default editor class name.
			editorCls: 'editor'
		},

		// close dialog.
		close: function (e) {
			this.element.hide();
			if (this.overlay) {
				this.overlay.hide();
			}
		},

		show: function () {
			if (this.overlay) {
				this.overlay.show();
			}
		},

		captureKeys: function () {
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

		// create dialog ui.
		createui: function () {
			var that = this,
			close = this.element.find('.'.concat(this.closeCls)),
			editor = this.element.find('.'.concat(this.options.editorCls)).first();
			if (close.length) {
				this.closeDelegate = function (e) {
					return that.close(e);
				};
				close.on('click', this.closeDelegate);
			}

			if (editor.length) {
				this.editor = editor.editor();
			}

			if (this.modal) {
				this.overlay = $('.'.concat(this.overlayCls));
			}
		},

		// initialize dialog ui.
		initui: function () {
			if (this.options.captureKeys) {
				this.captureKeys();
			}

			// If dialog has a editor, focus to it.
			if (this.editor) {
				this.editor.focus();
			}
		},

		destroyui: function () {
			this.element.parent().remove(this.element);
		},

		keydown: function (event) {
			if (event.which === this.keyCode.ESCAPE) {
				this.close();
				$.debug('ESC close dialog.');
			}
		},

		keypress: function (event) {
			// $.debug('dialog key pressed.');
		},

		keyup: function (event) {
			// $.debug('dialog key up.');
		}
	});
}($));
