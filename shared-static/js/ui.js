/*jslint browser: true*/
/*global  $*/

(function ($) {
	// "use strict";

	// Dialog ui.
	// requirement: draggble.
	$.ui.plugin('dialog', {
		// name.
		name: 'dialog',

		// close dialog.
		close: function (e) {
		},

		createui: function () {
			var
			close = this.element.find('dialog-close'),
			// draggableReg = /[\w]?draggable[\w]?$/,
			draggable = this.element.attr('class');
			if (close.length) {
				close.on('click', this.close);
			}
		},
	});
}($));
