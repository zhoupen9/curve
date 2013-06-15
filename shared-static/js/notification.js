
!(function ($) {

	var Notification = function () {};

	Notification.prototype = {
		Types: [
			'Info',
			'Warn',
			'Alert',
			'Remote',
		],

		show: function (parent, notify, duration) {
			var that = this, html = '<li class="notification-item">'
				+ '<div class="notification">'
				+ '<button class="close" data-dismiss="close">&times;</button>'
				+ '<small>' + notify.content + '</small>'
				+ '</div>'
				+ '</li>';
			parent.append(html);
			this.element = parent.find('li:last');
			this.element.fadeIn('slow');
			
			if (duration) {
				setTimeout(function () {
					that.close();
				}, duration * 1000);
			}
		},

		close: function () {
			var that = this.element;
			// this.element.fadeOut('slow');
			this.element.animate({
				'right': '-=250px',
			}, {
				duration: 200,
				always: function () {
					that.remove();
				}
			});
		}
	};

	$.curve.ui('notification', {
		// default notification options.
		options: {
			position: 'top',
			delay: 2000, // milliseconds.
			animation: 'fade',
		},

		// all notifications.
		notifications: [],

		createui: function () {
		},

		destroyui: function () {
		},

		// Add a notification.
		// If type is 'Remote', then content will be a valid URL.
		notify: function (notify) {
			var notification = new Notification(),
			parent = this.element.find('ol').last();
			
			if (notify.type === 'Remote') {
				// fetch remote content.
			} else {
				notification.show(parent, notify, 5);
			}
		}
	});
}(jQuery));
