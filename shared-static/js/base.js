
!(function ($) {
	// 'user strict';

	// base script to initialize global facilities includes,
	// global post button inside top navigate bar.
	// global post dialig setup.
	// dropdown menu inside top navigate bar.
	$(document).ready(function () {
		var session,
		host = '/connection/connect',
		poll = '/connection/request',
		userid = $('#current-user').data('data-user-id');

		// enable jQuery csrf support.
		$.csrfSetup();

		// connect to connection manager.
		$.curve.CM.connect(host, poll)
			.done(function () {
				session = $.curve.CM.get(host);
				if (session.isConnected()) {
					$.debug('polling...');
					session.send();
				} else {
					$.debug('session creation failed.');
				}
			});

		// click handler for 'message' inside top bar.
		$('#message').click(function (e) {

		});
		
		// create global poster inside post dialog.
		$('#post-dlg').find('.dialog-body').poster();
		
		// global post button handler.
		$('#global-post-btn').click(function (e) {
			$('#post-dlg').dialog(/*{ modal: false}*/).draggable().show();
		});
		
		// post dialog post button handler.
		$('#global-post').click(function (e) {
			var form = $('#post-dlg > .post-form'),
			spans = $('post-button > span');

			spans.toggleClass('hide');
			$.post(form.attr('action'), form.serialize())
				.done(function () {
					$('#post-dlg').fadeOut();
				})
				.fail(function () {})
				.always(function () {
					spans.toggleClass('hide');
				});
		});
		
		// top bar dropmenu handler.
		$('#messages-menu').click(function (e) {
			$('#msg-dlg').dialog().draggable().show();
			e.preventDefault();
		});
	});
}(jQuery));
