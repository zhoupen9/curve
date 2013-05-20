/*jslint browser: true*/
/*global  $*/

(function ($) {
    "use strict";
    
    $.plugin('draggable', {
        /* Default options. */
        options: {
        },
        
        /* create draggable. */
        create: function (options, elem) {
	    if (options) {
		$.extend(this, options);
	    }
	    if (elem) {
		return $.extend($(elem), this);
	    }
        },
        
        /* Initialize draggable. */
        init: function (options, elem) {
            $(elem).on('mousedown', '.dialog-header', this.handleMouseDown);
            $(elem).on('mousemove', '.dialog-header', this.handleMouseMove);
            $(elem).on('mouseup', '.dialog-header', this.handleMouseUp);
        },
        
        /* Destroy draggable. */
        destroy: function () {
            $(this).off('mousemove mouseup mousedown');
        },
        
        handleMouseMove: function (e) {
	    var x, y, parent = $(this).closest('.draggable');
	    if ($(this).data('dragging')) {
                //var oX = e.clientX - iX, oY = e.clientY - iY;
                x = e.pageX - $(this).data('offsetX');
                y = e.pageY - $(this).data('offsetY');
                parent.css({"left": x + "px", "top": y + "px"});
	    }
        },
        
        handleMouseDown: function (e) {
            $(this).data('dragging', true);
            $(this).data('offsetX', e.pageX - $(this).offset().left);
            $(this).data('offsetY', e.pageY - $(this).offset().top);
            // var that = this, header = $(this).find('.dialog-header');
            // // test if mouse is over header.            
            // if (header[0] === e.target || $.contains(header[0], e.target)) {
            //     $(this).data('dragging', true);
            //     $(this).data('offsetX', e.pageX - $(this).offset().left);
            //     $(this).data('offsetY', e.pageY - $(this).offset().top);
            
            //     // handle parent mouse move to move draggable.
            //     $(':parent').on('mousemove', function (e) {
            //         if ($(that).data('dragging')) {
            //             var x = e.pageX - $(that).data('offsetX'),
            //                 y = e.pageY - $(that).data('offsetY');
            //             $(that).css({"position": "relative", "left": x + "px", "top": y + "px"});
            //         }
            //     });
                
            //     // handle parent mouse up to release dragging.
            //     $(':parent').on('mouseup', function (e) {
            //         if ($(that).data('dragging')) {
            //             $(that).removeData('dragging');
            //         }
            //     });
            // }
        },
        
        handleMouseUp: function (e) {
	    var draggable;
	    if ($(this).data('draggable')) {
		$(this).off('mousemove mouseup');
	    } else {
		draggable = $(this).find('.draggable');
	    }
            draggable.removeData('dragging');
            draggable.off('mousemove mouseup');
            e.cancelBubble = true;
        }
    });
}($));
