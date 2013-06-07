
!(function ($) {
	// poster contains a post editor and a post toolbar.
	$.curve.ui('poster', {
		// post button class name.
		postBtnCls: 'post-button',

		// post form class.
		formCls: 'post-form',
		
		createui: function () {
			var that = this, postBtn = this.element.find('.'.concat(this.postBtnCls));
			this.form = this.element.find('.'.concat(this.formCls);
			this.postDelegate = function (e) {
				return that.post();
			};
			postBtn.on('click', this.postDelegate);
		},

		initui: function () {
		},

		show: function () {
			if (this.editor) {
				this.editor.focus();
			}
		},

		// post content in editor.
		post: function () {
			var content;
			content = this.editor.normalized();

			if (content.trim().length < 1) {
				// stop submit if content is empty(only contains whitespace is consided as empty as well).
				return false;
			}
			// set normalized content to textarea for submitting.
			this.element.find('textarea').first().html(content);

			return this.form.submit();
		}
	});
}($));
