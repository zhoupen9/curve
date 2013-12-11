/*jslint browser: true*/
/*global $, jQuery*/

(function ($) {
	"use strict";

	// Dialog ui.
	$.curve.ui('dialog', {
		// name.
		name: 'dialog',

		// dialog close class name.
		closeCls: 'dialog-close',

		// dialog overlay class name.
		overlayCls: 'modal-overlay',

		captionClas: 'dialog-title',

		// default dialog options.
		options: {
			// default behavior.
			modal: true,
			// default keyboard behavior.
			captureKeys: true
		},

		// close dialog.
		close: function (e) {
			this.element.fadeOut();
			if (this.overlay) {
				this.overlay.fadeOut();
			}
		},

		// show dialog.
		show: function () {
			var i, focus;
			
			if (this.overlay) {
				this.overlay.show();
			}

			// check if dialog contains any focusables, if so, set focus to the first found.
            if (this.focusable && this.focusable.length) {
                for (i = 0; i < this.focusable.length; i += 1) {
                    focus = this.element.find(this.focusable[i]);
                    if (focus.length) {
                        focus[0].focus();
                        return;
                    }
                }
            }
		},

		// update caption.
		updateCaption: function (caption) {
			this.element.find('.'.concat(this.captionCls)).html(caption);
		},

		// capture keys.
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
                close = this.element.find('.'.concat(this.closeCls));
			
			if (close.length) {
				this.closeDelegate = function (e) {
					return that.close(e);
				};
				close.on('click', this.closeDelegate);
			}

			if (this.options.modal) {
				this.overlay = $('.'.concat(this.overlayCls));
			}
		},

		// initialize dialog ui.
		initui: function () {
			if (this.options.captureKeys) {
				this.captureKeys();
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
}(jQuery));
