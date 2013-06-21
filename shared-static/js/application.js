
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
			this.inits = [ this.initHome, this.initDocuments, $.noop, $.noop ];
			// init nav bar.
			this.initNavBar();
		},

		initClickHandlers: function () {
			var that = this;
			// Disable certain links in docs
			$('section [href^=#]').click(function (e) {
				e.preventDefault()
			});

			// create global poster inside post dialog.
			$('#post-dlg').find('.dialog-body').poster();

			// global post button handler.
			$('#global-post-btn').click(function (e) {
				$('#post-dlg').dialog().draggable().show();
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
			// $(loading).css({ opacity: 1 });
			that.loading.css({
				opacity: 1,
				'-webkit-transform': 'scale(1)',
				'-moz-transform': 'scale(1)',
				transform: 'scale(1)',
			});
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
						that.loading.css({
							opacity: 0,
							'-webkit-transform': 'scale(0)',
							'-moz-transform': 'scale(0)',
							transform: 'scale(0)',
						});
					}, 200);
				});
		},

		// initialize navigate bar.
		initNavBar: function () {
			var app = this, link, current,
			nav = $('#topbar ul.js-global-nav'),
			path = window.location.pathname,
			find = nav.find('a[href^="' + path + '"]');

			if (find.length) {
				current = nav.children('.active:first');
				current && current.toggleClass('active');
				find.parent().toggleClass('active');
			}
			nav.switchTo = function (elem) {
				current = nav.children('.active:first')
				current.toggleClass('active');
				$(elem).parent().toggleClass('active');
			};

			nav.fail = function (elem) {
				app.notification.notify({
					type: 'alert',
					content: 'Failed to open: ' + $(elem).attr('href')
				});
			};
			
			$('#topbar ul>li a.js-nav').each(function (index, elem) {
				link = $(this).ajaxlink().data('ajaxlink');
				link.done = function ()  {
					nav.switchTo(elem);
					app.inits[index].call();
				};
				link.fail = function () {
					nav.fail(elem);
				};
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
	};

	// Ajax loader.
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

	// Ajax link, makes links load by ajax.
	$.curve.ui('ajaxlink', {
		options: {
			load: 'ajax',
		},

		createui: function () {
			var that = this, deferred, url = this.element.attr('href'), title = this.element.html();

			this.clickDelegate = function (e) {
				if (url === window.location.pathname || url === window.location.href) {
					$.debug('Target location is present, ignore.');
					return false;
				}

				deferred = $.curve.application.loadPage(url, title);

				$.each(['done', 'fail', 'always'], function (i, name) {
					that[name] && deferred[name](that[name]);
				});
				return e.preventDefault();
			};
			this.element.on('click', this.clickDelegate);
		},
	});

	// Application instance.
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
