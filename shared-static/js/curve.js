/*jslint browser: true*/
/*global  $*/
$(document).ready(function () {
    "use strict";
    // setup all draggable elements' event handlers.
    $('.draggable .dialog-header').each(function (index, element) {
        $(this).mousedown(function (e) {
            this.dragging = true;
            var offset = $(this).parent().parent().offset();
            this.offsetX = e.pageX - offset.left;
            this.offsetY = e.pageY - offset.top;
            $('#debug-output-panel').text($(this).parent().parent().attr('class'));
            //$('#debug-output-panel').text('pageX:' + e.pageX + ', pageY:' + e.pageY + ', x:' + this.deltaX + ', y:' + this.deltaY);
            //$('#debug-output-panel').text('dragging: [' + element.dragging + ']');
            //this.setCapture && this.setCapture();
            //window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            return false;
        });
        
        $(this).mousemove(function (e) {
            if (this.dragging) {
                //var oX = e.clientX - iX, oY = e.clientY - iY;
                var x = e.pageX - this.offsetX, y = e.pageY - this.offsetY;
                $('#debug-output-panel').text('pageX:' + e.pageX + ', pageY:' + e.pageY + ', x:' + x + ', y:' + y);
                $(this).parent().parent().css({"left": x + "px", "top": y + "px"});
                return false;
            }
            return true;
        });
        
        //$(this
        
        $(this).mouseup(function (e) {
            this.dragging = false;
            //window.releaseCapture();
            //window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
            e.cancelBubble = true;
        });
    });
    
    $('#global-post-btn').click(function () {
        $('#global-post-dialog').show();
    });
});