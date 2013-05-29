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

		options: {
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
			this.element.on('keydown', this.keydown);
			this.element.on('keypress', this.keypress);
			this.element.on('keyup', this.keyup);
		},

		// create dialog ui.
		createui: function () {
			var that = this,
			close = this.element.find('.'.concat(this.closeCls)),
			editor = this.element.find('.'.concat(this.options.editorCls));
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
				this.editor.initui();
			}
		},

		destroyui: function () {
			this.element.parent().remove(this.element);
		},

		keydown: function (event) {
		},

		keypress: function (event) {
		},

		keyup: function (event) {
		}
	});
}($));
