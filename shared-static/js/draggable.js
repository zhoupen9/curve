/*jslint browser: true*/
/*global  $*/

(function ($) {
    "use strict";
    // jquery draggable.
    $.fn.draggable = function () {
        function isIntersect(e) {
            
        }
        var that = this;
        $(this).mousedown(function (e) {
            // test if mouse is over header.
            var that = $(this).find('.dialog-close'), c = that.get();
            if (that && (c == e.target || $.contains(c, e.target))) {
                $(this).hide();
            }
//            
//            var startOffset = $(this).offset();
//            $(this).data('dragging', true);
//            $(this).data('offsetX', e.pageX - startOffset.left);
//            $(this).data('offsetY', e.pageY - startOffset.top);
//            $('#debug-output-panel').text($(this).attr('class'));
//        
//            $(':parent').mousemove(function (e) {
//                if ($(that).data('dragging')) {
//                    var x = e.pageX - $(that).data('offsetX'), y = e.pageY - $(that).data('offsetY');
//                    $(that).css({"left": x + "px", "top": y + "px"});
//                }
//            });
//            $(':parent').mouseup(function (e) {
//                if ($(that).data('dragging')) {
//                    $(that).removeData('dragging');
//                }
//            });
//            return false;
        });
        
        $(this).mousemove(function (e) {
            if ($(this).data('dragging')) {
                //var oX = e.clientX - iX, oY = e.clientY - iY;
                var x = e.pageX - $(this).data('offsetX'), y = e.pageY - $(this).data('offsetY');
                $('#debug-output-panel').text('pageX:' + e.pageX + ', pageY:' + e.pageY + ', x:' + x + ', y:' + y);
                $(this).css({"left": x + "px", "top": y + "px"});
                return false;
            }
            return true;
        });
        
        $(this).mouseup(function (e) {
            $(this).removeData('dragging');
            //window.releaseCapture();
            //window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
            $(':parent').off('mousemove mouseup');
            //$(this).off('mousemove mouseup');
            e.cancelBubble = true;
        });
        
        return this;
    };
}($));