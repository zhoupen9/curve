
!(function ($) {
	// 'use strict';
	$.curve.component('ajaxloader', {
		load: function (url, method) {
			var deferred = $.Deferred();

			method = method || 'get';
			$[method](url)
				.done(function (response) {
					deferred.resolve(response);
				})
				.fail(function (jqxhr, status, error) {
					deferred.reject(jqxhr, status, error);
				}).
				always(function (response, status, jqxhr) {
					deferred.always(response, status, jqxhr);
				});

			return deferred.promise();
		}
	});
}(jQuery));
