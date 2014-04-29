/*jslint browser: true*/
/*global $, jQuery*/

(function ($) {
    'use strict';
	var Reader = function () {};

	$.curve.ui('reader', {
		show: function () {
			this.dialog.show();
		},

		createui: function () {
			this.dialog = this.element.dialog().data('dialog');
			this.element.draggable();
		},

		// Open doucment.
		openDoc: function (documentId) {
			var that = this, caption;

			this.openDelegate = function (response) {
				that.element.find('.reader-content').append(response);
				caption = that.element.find('.document-title>h2').first().html();
				that.dialog.updateCaption(caption);
			};
			this.alertDelegate = function () {
				that.element.find('.alert').show();
			};
			this.hideLoadingDelegate = function () {
				that.element.find('.reader-loading').toggleClass('hide');
			};
			setTimeout(function () {
				$.get('/document/' + documentId)
					.done(that.openDelegate)
					.fail(that.alertDelegate)
					.always(that.hideLoadingDelegate);
			}, 2000);
		}
	});
}(jQuery));
