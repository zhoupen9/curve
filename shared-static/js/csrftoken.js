
!(function ($) {
	// 'use strict';
	// 'require jquery.cookie.js';
	// Check if given HTTP method si csrf safe.
	function csrfSafeMethod(method) {
		// these HTTP methods do not require CSRF protection
		return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	};

	// Check if given url comes from same origin.
	function sameOrigin(url) {
		// test that a given url is a same-origin URL
		// url could be relative or scheme relative or absolute
		var host = document.location.host; // host + port
		var protocol = document.location.protocol;
		var sr_origin = '//' + host;
		var origin = protocol + sr_origin;
		// Allow absolute or scheme relative URLs to same origin
		return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
			(url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
			// or any other URL that isn't scheme relative or absolute i.e relative.
			!(/^(\/\/|http:|https:).*/.test(url));
	};
	
	$.csrfSetup = function () {
		var csrftoken = $.cookie('csrftoken');
		
		$.ajaxSetup({
			beforeSend: function(jqxhr, settings) {
				if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
					// Send the token to same-origin, relative URLs only.
					// Send the token only if the method warrants CSRF protection
					// Using the CSRFToken value acquired earlier
					jqxhr.setRequestHeader("X-CSRFToken", csrftoken);
				}
			}
		});
	};
}(jQuery));
