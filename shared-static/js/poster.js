
!(function ($) {
	// poster contains a post editor and a post toolbar.
	$.curve.ui('poster', {
		// post button class name.
		postBtnCls: 'post-button',

		// default editor class name.
		editorCls: 'editor',

		// post form class.
		formCls: 'post-form',

		// create poster ui.
		createui: function () {
			var that = this,
			editor = this.element.find('.'.concat(this.editorCls)).first();
			
			this.postBtn = this.element.find('.'.concat(this.postBtnCls).concat('>button'));
			this.form = this.element.find('.'.concat(this.formCls));
			this.postDelegate = function (e) {
				return that.post();
			};

			if (editor.length) {
				this.editorChangeDelegate = function (e) {
					return that.editorChange(e);
				};
				// save eidtor's reference, editor plugin was stored in editor
				// element's data. See curve.js about plugin implementation.
				this.editor = editor.editor().data('editor');
				this.element.on('change.editor', this.editorChangeDelegate);
			}

			this.postBtn.on('click', this.postDelegate);
		},

		initui: function () {
		},

		// handle show.
		show: function () {
			// focus to editor.
			if (this.editor) {
				this.editor.focus();
			}
		},

		// handle editor change.
		editorChange: function (e) {
			var content = this.editor.normalized();
			// this.postBtn.attr('disabled', content.trim().length);
			if (content.trim().length) {
				this.postBtn.removeAttr('disabled');
			} else {
				this.postBtn.attr('disabled') || this.postBtn.attr('disabled', 'disabled');
			}
		},

		// post content in editor.
		post: function () {
			var content, action = this.form.attr('action');
			content = this.editor.normalized();

			if (content.trim().length < 1) {
				// stop submit if content is empty(only contains whitespace is consided as empty as well).
				return false;
			}
			// set normalized content to textarea for submitting.
			this.element.find('textarea').first().html(content);
			// submit post form via jquery's ajax facility.
			$.post(action, this.form.serialize())
				.done(function () {})
				.fail(function () {})
				.always(function () {});

			return true;
		}
	});
}($));
