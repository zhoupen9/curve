
!(function ($) {

	var Notification = function () {};

	Notification.prototype = {
		Types: [
			'Info',
			'Warn',
			'Alert',
			'Remote',
		],

		show: function (parent, notify) {
			var that = this, html = '<li class="notification-item ' + notify.type + '">'
				+ '<div class="notification">'
				+ '<button class="close" data-dismiss="close">&times;</button>'
				// + '<small>' + notify.content + '</small>'
				+ '<div class="notification-content">' + notify.content + '</div>'
				+ '</div>'
				+ '</li>';
			
			parent.append(html);
			this.element = parent.find('li:last');
			this.element.find('button').last().click(function (e) {
				if (that.timer) {
					window.clearTimeout(that.timeout);
				}
				that.close();
			});

			if (notify.handler) {
				this.element.on('click', notify.handler);
			}
			
			this.element.fadeIn('slow');

			this.updateInternal(notify);
		},

		updateInternal: function (notify) {
			var that = this;
			
			this.type = notify.type;
			this.duration = notify.duration;
			if (this.type !== 'alert' && this.duration) {
				this.timer = window.setTimeout(function () {
					that.close();
				}, this.duration);
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
		},

		update: function (notify) {
			var html = '<div class="notification-content">' + notify.content + '</div>';
			
			this.element.find('.notification-content').remove();
			this.element.find('.notification').append(html);

			if (this.timer) {
				window.clearTimeout(this.timer);
			}
			this.updateInternal(notify);
		}
	};

	$.curve.ui('notification', {
		// default notification options.
		options: {
			position: 'top',
			duration: 2000, // milliseconds.
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

			if (notify.duration === undefined) {
				notify.duration = this.options.duration;
			}
			
			if (notify.type === 'Remote') {
				// fetch remote content.
			} else {
				notification.show(parent, notify);
			}
			return notification;
		}
	});
}(jQuery));
