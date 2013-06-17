
!(function ($) {
	// 'use strict';

	$.curve.component('ajaxloader', {
		load: function (url, method) {
			var deferred = $.Deferred();
			
			$[method](url)
				.done(function (response) {
					deferred.resolve(response);
				})
				.fail(function (jqxhr, status, error) {
					deferred.reject(error);
				}).
				always(function (reponse) {
				});

			return deferred.promise();
		}
	});
}(jQuery));
