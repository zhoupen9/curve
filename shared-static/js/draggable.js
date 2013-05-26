/*jslint browser: true*/
/*global $*/

(function ($) {
	// "use strict";
	
	$.ui('draggable', {
		// plugin name.
		name: 'draggable',
		
		// original document mousedown handler.
		orig: undefined,

		// dragging
		dragging: false,

		// if drag delay met.
		delayMet: true,

		// if drag minium disttance met.
		distanceMet: true,

		// draggable class name.
		dragCls: 'dialog-header',
		
		// Default options.
		options: {
			delay: 200, // delay 200 miliseconds to fire mouse events.
			distance: 4 // default fire mouse events when distance between start drag point great then 4 pixels.
		},
		
		// create draggable.
		createui: function () {
			$.debug('creating draggable.');
		},

		// clear document mouse event handlers.
		clearbindings: function () {
			document.onmousemove = this.orig;
			$(document).off('mousemove.' + this.name + ' mouseup.' + this.name);
		},
		
		// Initialize draggable.
		initui: function () {
			var that = this;
			this.orig = document.onmousedown;
			this.element.on('mousedown.' + this.name, '.'.concat(this.dragCls), function (e) {
				return that.handleMouseDown(e);
			});
		},
		
		// Destroy draggable.
		destroyui: function () {
			this.element.off('.' + this.name);
			this.clearbindings();
		},
		
		// Handle mouse down event.
		// When mouse down on draggable element, set dragging flag to true,
		// Register event handler on document to handle mouse move and mouse up.
		// @param e mouse event.	 
		handleMouseDown: function (e) {
			var that = this;
			if (!this.delayMet) {
				return;
			}
			if (this.options.delay) {
				setTimeout(function () {
					that.delayMet = true;
				}, this.options.delay);
			}

			// binding mouse events of document for mouse move and up.
			this.mousemoveDelegate = function (e) {
				return that.handleMouseMove(e);
			};
			this.mouseupDelegate = function (e) {
				return that.handleMouseUp(e);
			};
			$(document).on('mousemove.' + this.name, this.mousemoveDelegate);
			$(document).on('mouseup.' + this.name, this.mouseupDelegate);
			// update dragging to true.
			this.dragging = true;
			// record current position.
			this.offsetX = e.pageX - this.element.offset().left;
			this.offsetY =	e.pageY - this.element.offset().top;
			this.lastX = this.startX = e.pageX;
			this.lastY = this.startY = e.pageY;

			$.debug('mouse down on draggable.');

			e.preventDefault();
			return true;
		},

		// Handle mouse move on document.
		// If element has dragging flag set to true, then move element to current mouse's
		// position (drag).
		handleMouseMove: function (e) {
			var x, y;
			if (this.dragging) {
				if (!this.delayMet || !this.distanceMet) {
					return;
				}
				if (this.options.distance) {
					if ((Math.abs(this.lastX - e.pageX) + Math.abs(this.lastY - e.pageY)) < this.options.distance) {
						return e.preventDefault();
					}
				}
				x = e.pageX - this.offsetX;
				y = e.pageY - this.offsetY;
				this.element.css({"left": x + "px", "top": y + "px"});
				this.lastX = e.pageX;
				this.lastY = e.pageY;
				return e.preventDefault();
			}
			$.warn('mouse moving while drag not active.');
			return !dragging;
		},
		
		// Handle mouse up on document.
		// Set element dragging flag to false and unbind all event handlers.
		handleMouseUp: function (e) {
			$.debug('draggable mosue up.');
			this.dragging = false;
			this.clearbindings();
		}
	});
}($));
