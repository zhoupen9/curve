
// Determine if given object is null
function isNull(value) {
	return value === undefined || value === null;
}

// Determine if give object is empty.
function isEmptyValue(value) {
	return isNull(value) || value === '';
}

// Determine if given control's value if empty.
// 
function isEmpty(control, value) {
	if (!control) {
		value = control;
	} else {
		value = control ? control.val() : null;
	}
	return isEmptyValue(value);
}

// Determine if given jquery object has class matches name.
function hasClass(obj, name) {
	var i, classes = obj.attr('class').split(/\s+/);

	if (!name || isEmptyValue(name)) {
		return false;
	}
	for (i = 0; i < classes.length; i++) {
		if (classes[i] === name) {
			return true;
		}
	}
}
