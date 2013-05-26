/*jslint browser: true*/
/*global  $*/

(function ($) {
	// "use strict";

	// Dialog ui.
	$.ui('dialog', {
		// name.
		name: 'dialog',

		// dialog close class name.
		closeCls: 'dialog-close',

		// dialog overlay class name.
		overlayCls: 'modal-overlay',

		// default behavior.
		modal: true,

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

			if (this.modal) {
				this.overlay = $('.'.concat(this.overlayCls));
			}
		},

		// initialize dialog ui.
		initui: function () {
		},

		destroyui: function () {
			this.element.parent().remove(this.element);
		}
	});
}($));
