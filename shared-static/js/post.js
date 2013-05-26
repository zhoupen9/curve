
(function ($) {
	// Post.
	var Post = function () {
	};

	Post.prototype = {};
	
	// post.
	$.fn.publishPost = function () {
	};

	

	$.fn.addPostToStream = function (posts) {
		var html, newposts = [], key;
		$.each(posts, function (index, post) {
			for (key in post) {
				newposts.push('<div>' + key + ': ' + post[key] + '</div>');
			}
		});

		html = newposts.join('');
		$.debug(html);
		this.html(html);
	};
}($));
