/*jslint browser: true*/
/*global  $*/
$(document).ready(function () {
    "use strict";
    // setup all draggable elements' event handlers.
    $('.draggable').each(function (index, element) {
        $(this).draggable();
    });
    
    $('#global-post-btn').click(function () {
        $('#global-post-dialog').show();
    });
});