let OBJ = {}.toString();
let REG = {}.toString.call(/.*/);
let DATE = {}.toString.call(new Date());

function isArray(arr) {
	return Array.isArray(arr)
}
isArray.type = 'array'

function isObject(obj) {
	return {}.toString.call(obj) === OBJ;
}
isObject.type = 'object'
function isNumber(num) {
	return typeof num === 'number';
}
isNumber.type = 'number'

function isString(str) {
	return typeof str === 'string';
}
isString.type = 'string'
function isDate(date){
	return {}.toString.call(date) === DATE;
}
isDate.type = 'Date'
function isReg(reg) {
	return {}.toString.call(reg) === REG;
}
isReg.type = 'RegExp'

function oneOfType(types = []) {
	return function(val) {
		for(let i = 0, len = types.length; i < len; i ++) {
			let propType = types[i];
			if(propType(val)) {
				return true;
			}
		}
		return false;
	}
}


const PropTypes = {
	Array: isArray,
	number: isNumber,
	Object: isObject,
	string: isString,
	Date: isDate,
	reg: isReg,
	oneOfType: oneOfType
}

module.exports = PropTypes;