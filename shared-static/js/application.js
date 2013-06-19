
!(function ($) {
	// 'user strict';

	var Application = function () {};

	Application.prototype = {
		init: function () {
			// enable jQuery csrf support.
			$.csrfSetup();
			// init click handlers.
			this.initClickHandlers();
			// setup notification.
			this.notification = $('#notifications').notification().data('notification');
			this.loading = $('#loading');
		},

		initClickHandlers: function () {
			var that = this;
			// Disable certain links in docs
			$('section [href^=#]').click(function (e) {
				e.preventDefault()
			});
			// click handler for 'message' inside top bar.
			$('#message').click(function (e) {
				noti.notify({ type: 'alert', content: 'Message topbar button clicked.'});
			});

			$('#conference').click(function (e) {
				noti.notify({ type: 'warn', content: 'Sample warnning.'});
			});

			$('#home').click(function (e) {
				e.preventDefault();
				that.loadPage('/home').done(that.initHome);
			});

			$('#documents').click(function (e) {
				e.preventDefault();
				that.loadPage('/document').done(that.initDocuments);
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
		},

		// ajax load page.
		loadPage: function (url, title, method) {
			var that = this;
			method = method || 'get';
			$(loading).css({ opacity: 1 });
			return $.curve.ajaxloader.load(url, method)
				.done(function (response) {
					window.history.pushState('connection', title, url);
					$('#page > .container').remove();
					$('#page').append(response);
				})
				.fail(function (jqxhr, status, error) {
					that.notification.notify({ type: 'alert', content: 'status: ' + status + ', error: ' + error});
				})
				.always(function () {
					setTimeout(function () {
						$(loading).css({ opacity: 0});
					}, 2000);
				});
		},

		// initialize homepage.
		initHome: function () {
			var load = $('#load-posts'), loading = $('#loading-posts');
			load.on('click', function (e) {
				load.toggleClass('hide');
				loading.toggleClass('hide');
				$.get('/connection/notify').always(function () {
					load.toggleClass('hide');
					loading.toggleClass('hide');
				});
			});

			$('#activity-notify').click(function (e) {
				var i, items = $('#stream-items'), orig = items.length;
				$.get('/post/recent')
					.done(function (data) {
						items.prepend(data);
						for (i = 0; i < orig; i++) {
							items.children('li:nth-child(' + (i + 1) + ')').children('.post').post();
						}
					});
				e.preventDefault();
				// this.parentNode.removeChild(this);
			});
		},

		// initialize documents.
		// Click on documents will open reader.
		initDocuments: function () {
			$('.document').each(function () {
				var dlg, obj = $(this), doc = obj.data('doc-id');
				obj.click(function () {
					dlg = $('#reader-dlg');
					dlg.reader().show();
					dlg.data('reader').openDoc(doc);
				});
			});
		},

		// BOSH data handler.
		// This method will be called when there's data received from server.
		boshHandler: function (data) {
			if (typeof data === 'string') {
				$.debug('data is string !');
				return;
			}
			if (data && data.length) {
				for (var i = 0; i < data.length; i++) {
					html = data[i].type + ', ' + data[i].content;
					this.notification.notify({ type: 'remote', content: html});
				}
			} else if (data) {
				html = data.type + ', ' + data.content;
				this.notification.notify({ type: 'remote', content: html});
			}
		},

		// Create BOSH connection.
		connect: function (url) {
			// connect to connection manager.
			var that = this, connectNotify = this.notification.notify({
				type: 'info',
				content: '<span class="spinner"></span>Connecting to server...',
				duration: 0 // do not dispear.
			});
			window.setTimeout(function () {
				$.curve.CM.connect(url)
					.done(function (bosh, response) {
						this.connection = bosh;
						connectNotify.update({ type: 'info', content: 'Connected.', duration: 2000});
						bosh.addHandler(that.boshHandler)
					})
					.fail(function (bosh, response) {
						connectNotify.update({ type: 'alert', content: 'Failed to connect to server.'});
					});
			}, 2000);
		}
	},

	$.curve.application = new Application();

	// base script to initialize global facilities includes,
	// global post button inside top navigate bar.
	// global post dialig setup.
	// dropdown menu inside top navigate bar.
	$(document).ready(function () {
		var application = $.curve.application;
		// initialize application.
		application.init();
		// connect to connection manager.
		application.connect($.curve.options.connectionUrl);
	});
}(jQuery));
