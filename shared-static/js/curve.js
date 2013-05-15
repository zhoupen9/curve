/*jslint browser: true*/
/*global  $*/
$(document).ready(function () {
    "use strict";
    // setup all draggable elements' event handlers.
    $('.draggable .dialog-header').each(function (index, element) {
        $(this).mousedown(function (e) {
            var startOffset = $(this).parent().parent().offset();
            $(this).data('dragging', true);
            $(this).data('offsetX', e.pageX - startOffset.left);
            $(this).data('offsetY', e.pageY - startOffset.top);
            $('#debug-output-panel').text($(this).parent().parent().attr('class'));
            $(document).bind('mousemove.' + 
            return false;
        });
        
        $(this).mousemove(function (e) {
            if ($(this).data('dragging')) {
                //var oX = e.clientX - iX, oY = e.clientY - iY;
                var x = e.pageX - $(this).data('offsetX'), y = e.pageY - $(this).data('offsetY');
                $('#debug-output-panel').text('pageX:' + e.pageX + ', pageY:' + e.pageY + ', x:' + x + ', y:' + y);
                $(this).parent().parent().css({"left": x + "px", "top": y + "px"});
                return false;
            }
            return true;
        });
        
        //$(this
        
        $(this).mouseup(function (e) {
            $(this).removeData('dragging');
            //window.releaseCapture();
            //window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
            e.cancelBubble = true;
        });
    });
    
    $('#global-post-btn').click(function () {
        $('#global-post-dialog').show();
    });
});