
!(function ($) {
	// 'user strict';

	// base script to initialize global facilities includes,
	// global post button inside top navigate bar.
	// global post dialig setup.
	// dropdown menu inside top navigate bar.
	$(document).ready(function () {
		var session, notifications, noti, connectNotify, handler, html, connection,
		connect = '/connection/connect';
		
		// Disable certain links in docs
		$('section [href^=#]').click(function (e) {
			e.preventDefault()
		});

		// enable jQuery csrf support.
		$.csrfSetup();

		// create notification plugin.
		notifications = $('#notifications').notification();
		noti = notifications.data('notification');

		// connect to connection manager.
		connectNotify = noti.notify({ type: 'info', content: '<span class="spinner"></span>Connecting to server...', duration: 0});
		window.setTimeout(function () {
			$.curve.CM.connect(connect)
				.done(function (bosh, response) {
					connection = bosh;
					connectNotify.update({ type: 'info', content: 'Connected.', duration: 2000});
					bosh.addHandler(function (data) {
						if (typeof data === 'string') {
							$.debug('data is string !');
							return;
						}
						if (data && data.length) {
							for (var i = 0; i < data.length; i++) {
								html = data[i].type + ', ' + data[i].content;
								noti.notify({ type: 'remote', content: html});
							}
						} else if (data) {
							html = data.type + ', ' + data.content;
							noti.notify({ type: 'remote', content: html});
						}
					});
				})
				.fail(function (bosh, response) {
					connectNotify.update({ type: 'alert', content: 'Failed to connect to server.'});
				});
			
		}, 2000);

		// click handler for 'message' inside top bar.
		$('#message').click(function (e) {
			noti.notify({ type: 'alert', content: 'Message topbar button clicked.'});
		});

		$('#conference').click(function (e) {
			noti.notify({ type: 'warn', content: 'Sample warnning.'});
		});

		$('#blog').click(function (e) {
			e.preventDefault();
			window.history.pushState('connection', 'Blog', '/blog');
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
