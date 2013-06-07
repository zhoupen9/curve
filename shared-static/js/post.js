
(function ($) {
	// // Post.
	// var Post = function () {
	// };

	// Post.prototype = {};

	// register post ui plugin.
	$.curve.ui('post', {
		createui: function () {
			var that = this;
			this.clickDelegate = function (e) {
				return that.collapse(e);
			};
			this.element.on('click', this.clickDelegate);
		},

		// The original post was made up by markers with form
		// <ol>
		//  <li class="stream-item">
		//    <div class="post">...</div>
		//  </li>
		// </ol>
		// When it was collapsed, transit it into "collapsed"
		// <ol>
		//  <li class="stream-item stream-item-collapsed">
		//    <ol class="collapsed-post">
		//      <li>
		//        <div class="post">...</div>
		//      </li>
		//      <li>
		//        <div class="post response">...</div>  <-- If any responses exist.
		//      </li>
		//    </ol>
		//  </li>
		// </ol>
		collapse: function (e) {
			var ol, li, elem = this.element, postid = this.element.attr('data-post-id'), parent;

			if (!this.collapsed) {
				parent = this.element.parent();
				// toggle collapsed css.
				parent.toggleClass('open');
				ol = parent.children('ol').toggleClass('hide');
				li = ol.children().first();
				// move original post into 'li' tag.
				this.element.detach();
				this.element.appendTo(li);
				// add inline reply.
				this.collapsed = true;
			} else {
				parent = this.element.parentsUntil('ol.stream-items').last();
				parent.toggleClass('open');
				this.element.appendTo(parent);
				parent.children('ol').remove();
				this.collapsed = false;
			}
			// start loading contents.
			// if (!postid) {
			// 	$.debug('Failed find post id.');
			// 	return false;
			// }

			// $.get('/post/' + postid)
			// 	.done(function (data) {
			// 		elem.
			// 	});
		},

		insertInlineReply: function (element, post) {
			$.get('/post/' + post + '/inlinereply')
				.done(function (data) {
					element.append(data);
				});
		}
	});
}($));
