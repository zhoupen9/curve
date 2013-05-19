/*jslint browser: true*/
/*global  $*/

(function ($) {
    "use strict";
    
    $.Plugin.plugin('draggable', {
        /* Default options. */
        options: {
        },
        
        /* create draggable. */
        create: function () {
            return this;
        },
        
        /* Initialize draggable. */
        init: function () {
            $(this).delegate('mousedown', this.handleMouseDown);
            $(this).delegate('mousemove', this.handleMouseMove);
            $(this).delegate('mouseup', this.handleMouseUp);
        },
        
        /* Destroy draggable. */
        destroy: function () {
            $(this).off('mousemove mouseup mousedown');
        },
        
        handleMouseMove: function (e) {
            if ($(this).data('dragging')) {
                //var oX = e.clientX - iX, oY = e.clientY - iY;
                var x = e.pageX - $(this).data('offsetX'),
                    y = e.pageY - $(this).data('offsetY');
                $(this).css({"left": x + "px", "top": y + "px"});
            }
        },
        
        handleMouseDown: function (e) {
            var that = this, header = $(this).find('.dialog-header');
            // test if mouse is over header.            
            if (header[0] === e.target || $.contains(header[0], e.target)) {
                $(this).data('dragging', true);
                $(this).data('offsetX', e.pageX - $(this).offset().left);
                $(this).data('offsetY', e.pageY - $(this).offset().top);
            
                // handle parent mouse move to move draggable.
                $(':parent').on('mousemove', function (e) {
                    if ($(that).data('dragging')) {
                        var x = e.pageX - $(that).data('offsetX'),
                            y = e.pageY - $(that).data('offsetY');
                        $(that).css({"position": "relative", "left": x + "px", "top": y + "px"});
                    }
                });
                
                // handle parent mouse up to release dragging.
                $(':parent').on('mouseup', function (e) {
                    if ($(that).data('dragging')) {
                        $(that).removeData('dragging');
                    }
                });
            }
        },
        
        handleMouseUp: function (e) {
            $(this).removeData('dragging');
            $(':parent').off('mousemove mouseup');
            $(this).off('mousemove mouseup');
            e.cancelBubble = true;
        }
    });
}($));