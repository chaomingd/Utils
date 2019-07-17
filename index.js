import Platfrom from 'joshua-platform'

function getPositionTop(el) {
	if(!el) {
		console.error('el is null');
		return;
	}
	return getScrollTop() + el.getBoundingClientRect().top;
}

function getScrollTop() {
	return document.body.scrollTop || document.documentElement.scrollTop;
}

function getElRect(el) {
	if(!el) return;
	return el.getBoundingClientRect();
}

function setScrollTop(val) {
	document.body.scrollTop = document.documentElement.scrollTop = val;
}

function addEvent(el,type,fn) {
	if(!el || !type || !fn) return;
	el.addEventListener(type,fn);
	return function() {
		el.removeEventListener(type,fn)
	}
}


function imageLoader(el) {
	return new Promise((resolve,reject) => {
		let imgs = el.getElementsByTagName('img');
		let complete = 0;
		let err = false;
		let len = imgs.length;
		let count = len;
		console.log(count)
		function load() {
			complete ++;
				if(complete === count) {
					if(err) {
						return reject();
					}
					resolve();
					console.log('onload')
				}
		}
		function error() {
			complete ++;
			err = true;
		}
		for(let i = 0;i < len; i ++) {
			let img = imgs[i];
			if(img.src) {
				img.onload = load;
				img.onerror = error;
				if(getComputedStyle(img).display === 'none') {
					count --;
				}
			}else {
				count --;
			}
		}
	});
}

function toUrlUnderline(str) {
	return str.split(' ').map(s => s.toLowerCase()).join('-')
}


function EventEmiter() {
	this.listeners = {};
}
EventEmiter.prototype = {
	constructor: EventEmiter,
	on(type, fn) {
		if (!type || fn instanceof Array) return;
		if (!this.listeners[type]) {
			this.listeners[type] = [];
		}
		this.listeners[type].push(fn)
	},
	emit(type, ...args) {
		if (!type || typeof type !== 'string') return;
		let fns = this.listeners[type];
		if (!fns instanceof Array) return;
		fns.forEach(fn => {
			fn.call(this,{
				type,
				data: args.length <= 1 ? args[0]: [...args]
			}, args);
		})
	},
	remove(type, fn) {
		if (!type || typeof type !== 'string') return;
		if (!fn) {
			this.listeners[type] = [];
		} else {
			var fns = this.listeners[type];
			var len = fns.length;
			for (var i = len - 1; i >= 0; --i) {
				var f = fns[i];
				if (f === fn) {
					fns.splice(i, 1);
				}
			}
		}
	}
}

function getScrollBarWidth() {
	var noScroll, scroll, oDiv = document.createElement("DIV");
	oDiv.style.cssText = "position:absolute;top:-1000px;width:100px;height:100px; overflow:hidden;";
	noScroll = document.body.appendChild(oDiv).clientWidth;
	oDiv.style.overflowY = "scroll";
	scroll = oDiv.clientWidth;
	document.body.removeChild(oDiv);
	return noScroll-scroll;
}

var scroll = (function (deskclassName,mobileClassName) {
	let className = '';
	if(Platfrom.isDesktop) {
		className = deskclassName;
	}else {
		className = mobileClassName;
	}
	var scrollTop;
	var scrollBarWidth = getScrollBarWidth();
	return {
			afterOpen: function () {
				if(Platfrom.isDesktop) {
					document.body.classList.add(className);
					document.body.style.paddingRight = scrollBarWidth + 'px';
				}else {
					scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
					document.body.classList.add(className);
					document.body.style.top = -scrollTop + 'px';
				}
			},
			beforeClose: function () {
				if(Platfrom.isDesktop) {
					document.body.classList.remove(className);
					document.body.removeAttribute('style');
				}else {
					document.body.classList.remove(className);
					document.body.removeAttribute('style');
					window.scrollTo(0,scrollTop);
				}
			}
	};
})('overflow','positionFixed');


var urlRex = {
	protocol: /([^/]+:)\/\/(.*)/i,
	host: /(^[^:/]+)((?:\/|:|$)?.*)/,
	port: /:?([^/]*)(\/?.*)/,
	pathname: /([^?#]+)(\??[^#]*)(#?.*)/
};

function parseUrl(url) {
	var tmp, res = {};
	res["href"] = url;
	for (let p in urlRex) {
			tmp = urlRex[p].exec(url);
			res[p] = tmp[1];
			url = tmp[2];
			if (url === "") {
					url = "/";
			}
			if (p === "pathname") {
					res["pathname"] = tmp[1];
					res["search"] = tmp[2];
					res["hash"] = tmp[3];
			}
	}
	return res;
};


function nowTime() {
	return new Date().getTime();
}
function throttle(func, wait, options) {
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) options = {};
	var later = function() {
		previous = options.leading === false ? 0 : nowTime();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};
	return function() {
		var now = nowTime();
		if (!previous && options.leading === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			clearTimeout(timeout);
			timeout = null;
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
};


export { 
	getPositionTop,
	getScrollTop,
	setScrollTop,
	imageLoader,
	getElRect,
	addEvent,
	toUrlUnderline,
	EventEmiter,
	scroll,
	parseUrl,
	throttle
};