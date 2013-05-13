
function isNull(value) {
    return value == undefined || value == null;
}

function isEmptyValue(value) {
    return isNull(value) || value == '';
}

function isEmpty(control, value) {
    var val = control ? control.val() : null;
    if (!control) {
	return value ? isEmptyValue(value) : true;
    } else {
	return isEmptyValue(val);
    }
}
