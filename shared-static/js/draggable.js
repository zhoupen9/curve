/*jslint browser: true*/
/*global  $*/

(function ($) {
    "use strict";
    
    //$.support.selectstart = document.createElement("div").hasOwnProperty('onselectstart');
    // jquery draggable.
    $.fn.draggable = function () {
        var that = this, header = $(this).find('.dialog-header');
        
        // prevent selection.
//        $(this).on($.support.selectstart ? 'selectstart' : 'mousedown', function (e) {
//            e.preventDefault();
//        });
        
        // dialog close button click handler.
        $(this).find('.dialog-close').click(function (e) {
            $(this).closest('.dialog').hide();
            $(this).closest('.dialog-container').hide();
        });
        
        $(this).mousedown(function (e) {
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
        });
        
        $(this).mousemove(function (e) {
            if ($(this).data('dragging')) {
                //var oX = e.clientX - iX, oY = e.clientY - iY;
                var x = e.pageX - $(this).data('offsetX'),
                    y = e.pageY - $(this).data('offsetY');
                $(this).css({"left": x + "px", "top": y + "px"});
            }
        });
        
        $(this).mouseup(function (e) {
            $(this).removeData('dragging');
            //window.releaseCapture();
            //window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
            $(':parent').off('mousemove mouseup');
            $(this).off('mousemove mouseup');
            e.cancelBubble = true;
        });
        
        return this;
    };
}($));