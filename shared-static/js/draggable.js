/*jslint browser: true*/
/*global $*/

(function ($) {
	"use strict";

	// Helper to record element's start drag point and position element to new position.
	var Helper = function (elem, delay, distance) {
		var that = this;
		this.element = elem;
		this.delay = delay;
		this.distance = distance;
		this.delayMet = false;
		if (delay) {
			window.setTimeout(function () {
				that.delayMet = true;
			}, delay);
		}
	};

	// Helper prototype.
	Helper.prototype = {
		met: function (event) {
			return this.delayMet && this.distanceMet(event);
		},
		
		// Check if distance met.
		distanceMet: function (event) {
			if (this.lastX === undefined || this.lastY === undefined) {
				return true;
			}
			return this.distance && (Math.abs(this.lastX - event.pageX) + Math.abs(this.lastY - event.pageY)) > this.distance;
		},

		// Postion target element according to current dragging position.
		position: function (event) {
			var x, y;
			if (!this.met(event)) {
				return false;
			}

			x = event.pageX - this.offsetX;
            y = event.pageY - this.offsetY;
			this.element.css({"left": x + "px", "top": y + "px"});
			this.lastX = event.pageX;
			this.lastY = event.pageY;
			this.update(event);
			
			return true;
		},

		// Update helper.
		update: function (event) {
			this.offsetX = event.pageX - this.element.offset().left;
			this.offsetY = event.pageY - this.element.offset().top;
			this.lastX = this.startX = event.pageX;
			this.lastY = this.startY = event.pageY;
		}
	};
	
	$.curve.ui('draggable', {
		// plugin name.
		name: 'draggable',
		
		// defaultdraggable class name.
		dragCls: 'dialog-header',
		
		// Default options.
		options: {
			delay: 200, // delay 200 miliseconds to fire mouse events.
			distance: 4 // default fire mouse events when distance between start drag point great then 4 pixels.
		},
		
		// create draggable.
		createui: function () {
			$.debug('creating draggable.');
			// introduce attribute to record original document mousedown handler.
			this.orig = undefined;
			// record if instance is been dragging.
			this.dragging = false;
			// if drag delay met.
			this.delayMet = true;
			// if drag minium disttance met.
			this.distanceMet = true;
			// create helper.
			this.helper = new Helper(this.element, this.options.delay, this.options.distance);
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
			if (this.helper) {
				delete this.helper;
			}
		},
		
		// Handle mouse down event.
		// When mouse down on draggable element, set dragging flag to true,
		// Register event handler on document to handle mouse move and mouse up.
		// @param e mouse event.	 
		handleMouseDown: function (e) {
			var that = this;
			if (e.which !== 1) {
				// only left mouse button can perform dragging.
				return;
			}

			if (!this.helper.met(e)) {
				return;
			}

			// binding mouse events of document for mouse move and up.
			this.mousemoveDelegate = this.mousemoveDelegate || function (e) {
				return that.handleMouseMove(e);
			};
			this.mouseupDelegate = this.mouseupDelegate || function (e) {
				return that.handleMouseUp(e);
			};
			$(document).on('mousemove.' + this.name, this.mousemoveDelegate);
			$(document).on('mouseup.' + this.name, this.mouseupDelegate);
			// update dragging to true.
			this.dragging = true;
			// record current position.
			this.helper.update(event);
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
				this.helper.position(e);
				return e.preventDefault();
			}
			$.warn('mouse moving while drag not active.');
			return !this.dragging;
		},
		
		// Handle mouse up on document.
		// Set element dragging flag to false and unbind all event handlers.
		handleMouseUp: function (e) {
			if (e.which !== 1) {
				return;
			}
			$.debug('draggable mosue up.');
			this.dragging = false;
			this.clearbindings();
		}
	});
}($));
