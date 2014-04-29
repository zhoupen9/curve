/*jslint browser: true*/
/*global console, $, jQuery*/

(function ($) {
    'use strict';
	var Notification = function () {};

	Notification.prototype = {
		Types: [
			'info',
			'warn',
			'alert',
			'remote'
		],
		
		// Notification list item class.
		ListItemClass: 'notification-item',
		
		// List item element.
		ListItem: '<li class="notification-item"></li>',
		
		// notification item class.
		ItemClass: 'notification',
		
		// notification content class.
		ItemContentClass: 'notification-content',

		// Show notification.
		show: function (parent, notify) {
			var that = this, origHandler, html = '<div class="' + this.ItemClass + '">'
				+ '<button class="close" data-dismiss="close">&times;</button>'
				+ '<div class="' + this.ItemContentClass + '">' + notify.content + '</div>'
				+ '</div>';

			if (parent) {
				// insert html to parent.
				parent.append(this.ListItem);
				this.element = parent.find('li:last');
				this.element.append(html);
				this.element.toggleClass(notify.type);
				this.element.fadeIn('slow');
			} else if (this.element) {
				// update element's inner html.
				origHandler = this.element.find('button').onclick;
				this.element.attr('class', this.ListItemClass);
				this.element.toggleClass(notify.type);
				this.element.html(html);
			} else {
				throw new Error('No parent to append, or element not exists.');
			}

			if (notify.handler) {
				this.element.on('click', notify.handler);
			}

			this.element.find('button').last().click(function (e) {
				that.close();
			});
			this.updateInternal(notify);
		},

		updateInternal: function (notify) {
			var that = this;
			
			this.type = notify.type;
			this.duration = notify.duration;
			if (this.type !== 'alert' && this.duration) {
				if (this.timer) {
					window.clearTimeout(this.timer);
				}
				this.timer = window.setTimeout(function () {
					that.close();
				}, this.duration);
			}
		},

		close: function () {
			var that = this.element;
			// clear timer.
			if (this.timer) {
				window.clearTimeout(this.timeout);
			}
			// animate to dispear.
			this.element.animate({
				'right': '-=250px'
			}, {
				duration: 200,
				always: function () {
					that.remove();
				}
			});
		},

		// update notification.
		update: function (notify) {
			this.show(null, notify);
		}
	};

	$.curve.ui('notification', {
		// default notification options.
		options: {
			position: 'top',
			duration: 2000, // milliseconds.
			animation: 'fade'
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
			var
                notification = new Notification(),
                parent = this.element.find('ol').last();

			if (notify.duration === undefined) {
				notify.duration = this.options.duration;
			}
			
			if (notify.type === 'Remote') {
				// fetch remote content.
                console.log('fetching remote...');
			} else {
				notification.show(parent, notify);
			}
			return notification;
		}
	});
}(jQuery));
