
!(function () {

	var Session = function () {},
	Manager = function () {};

	Session.prototype = {
		send: $.noop,
		recv: $.noop,
	};

	Manager.prototype = {
		// create session.
		createInternal: $.noop,
		
		create: function () {
		},

		close: function () {
		}
	};

	$.curve.session = new Session();
}($));
