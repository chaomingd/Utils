function formatNum(num) {
	return num.toFixed(2).replace(/\B(?=(\d{3})+\b)/g,',').replace(/^/,'$$ ')
}
function passwordReg(str) {
	var passwordReg = /(?!^[0-9A-z]+$)(?!^[a-zA-z]+$)^[0-9a-zA-Z]{6,12}$/;
	return passwordReg.test(str);
}
var word = 'hello my name is leon'
function wordFirstUppercase(str) {
	return str.replace(/\b[a-z]/g,function(firstLetter) {
		return firstLetter.toUpperCase();
	})
}
var str = '-moz-transform'
function camelize(str) {
	return str.replace(/(?!^)\-[a-z]/g,function(match) {
		return match.toUpperCase();
	}).replace(/\-/g,'')
}
var reg = /^\s+|\s+$/;
console.log(reg.source)
var string = "html,css,javascript";
console.log( string.split(/,/) );

// console.log(camelize(str))