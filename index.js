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

function getClientHeight() {
  var bodyClientHeight = document.body.clientHeight;
  var docClientHeight = document.documentElement.clientHeight;
  if (bodyClientHeight && docClientHeight) {
    return Math.min(docClientHeight, bodyClientHeight);
  } else {
    return Math.max(docClientHeight, bodyClientHeight);
  }
}

function getScrollHeight() {
  return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
}

export function drawPolygon(ctx, points) {
  var rect = findCenterOfPolygon(points)
  ctx.save();
  ctx.beginPath();
  ctx.translate(-rect.x, -rect.y)
  ctx.moveTo(points[0][0], points[0][1]);
  for (var i = 1, len = points.length; i < len; i++) {
    var point = points[i];
    ctx.lineTo(point[0], point[1])
  }
  ctx.closePath();
  ctx.restore();
}
export function findCenterOfPolygon(points) {
  var lMin, lMax, rMin, rMax, firstPoint = points[0];
  lMin = lMax = firstPoint[0];
  rMin = rMax = firstPoint[1];
  for (var i = 1, len = points.length; i < len; i++) {
    var point = points[i];
    if (point[0] < lMin) {
      lMin = point[0]
    }
    if (point[0] > lMax) {
      lMax = point[0]
    }
    if (point[1] < rMin) {
      rMin = point[1]
    }
    if (point[1] > rMax) {
      rMax = point[1]
    }
  }
  var width = lMax - lMin;
  var height = rMax - rMin;
  return {
    width,
    height,
    x: lMin + width / 2,
    y: rMin + height / 2,
  }
}

export function timeoutSync(fn, time) {
  var timer;
  var promise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      try {
        fn && fn();
        resolve();
      } catch (e) {
        reject(e)
      }
    }, time)
  });
  promise.timer = timer;
  return promise;
}

export const TRANSITIONEND = (function () {
  if (isServer) return '';
  var style = document.createElement('div').style;
  var transEndEventNames = {
    transition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
  }
  for (var name in transEndEventNames) {
    if (name in style) {
      return transEndEventNames[name]
    }
  }
})();

export function createNextCallbackObj() {
  var canCallback = true;
  return {
    safetyCallback(callback) {
      canCallback = true;
      return (...args) => {
        if (canCallback) {
          callback && callback(...args);
        }
      }
    },
    cancelCallback() {
      canCallback = false;
    }
  }
}

export function cover(box, target) {
  var boxRatio = box.height / box.width;
  var targetRatio = target.height / target.width;
  var width, height, left, top;
  if (targetRatio < boxRatio) {
    height = box.height;
    width = height / targetRatio;
    top = 0;
    left = (box.width - width) / 2;
  } else {
    width = box.width;
    height = width * targetRatio;
    left = 0;
    top = (box.height - height) / 2;
  }
  return {
    width,
    height,
    left,
    top,
  }
}

const Platform = (function () {
  if (isServer) return {};
  const ua = window.navigator.userAgent.toLowerCase();
  const html = document.getElementsByTagName('html')[0];
  class Platform {
    static hasTouch = 'ontouchstart' in window;
    static isiPad = ua.match(/ipad/i) !== null;
    static isNexus7 = ua.match(/Nexus 7/gi) !== null;
    static isMobile = ua.match(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile/i) !== null
      && ua.match(/Mobile/i) !== null;
    static isiPhone = ua.match(/iphone/i) !== null;
    static isAndroid = ua.match(/android/i) !== null;
    static isS4 = ua.match(/(gt-i95)|(sph-l720)/i) !== null;
    static isS5 = ua.match(/sm-g900/i) !== null;
    static isS6 = ua.match(/sm-g9250/i) !== null;
    static isS7 = (ua.match(/sm-g930(0|p|v)/i) !== null);
    static isIE = ua.match(/(msie|trident)/i) !== null;
    static isIE11 = ua.match(/Trident\/7\.0/i) !== null;
    static isEdge = ua.match(/edge/i) !== null;
    static isChrome = ua.match(/chrome/gi) !== null && ua.match(/edge/gi) === null;
    static isSafari = ua.match(/safari/gi) !== null && ua.match(/chrome/gi) === null;
    static isFirefox = ua.match(/firefox/gi) !== null;
    static isMac = ua.match(/mac/gi) !== null;
    static isWindows = ua.match(/windows/gi) !== null;
    static isSamsungNative = ua.match(/samsung/gi) !== null;

    static isAndroidPad = Platform.isAndroid && !Platform.isMobile;
    static isTablet = Platform.isiPad || Platform.isAndroidPad;
    static isDesktop = !(Platform.isMobile || Platform.isTablet);
    static isIOS = Platform.isiPad || Platform.isiPhone
  }

  for (const key of Object.keys(Platform)) {
    let className = key.toLowerCase().replace('is', '');

    if (className.includes('has')) {
      className = className.replace('has', 'has-');
    }

    if (!Platform[key]) {
      if (className.includes('has')) {
        className = className.replace('has', 'no');
      } else {
        className = `not-${className}`;
      }
    }

    html.classList.add(className);
    html.setAttribute(className, '');
  }
  return Platform;
})();

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


class scroller {
  constructor(initIndex, pages, options = {}) {
    this.changePageLoading = false;
    this.scrollProcess = 0;
    this.scrollTimeout = null;
    this.currentIndex = initIndex || 0;
    this.pages = pages || 3;
    this._listeners = [];
    this._canChange = true;
    this._wheelDeltas = [];
    this.touchstartPosition = 0;
    this.touchstartTime = 0;
    this.distance = 0;
    this.eslaped = 10000000;
    this.loop = options.loop;
    this.infinity = options.infinity;
    var supportsPassive = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function () {
          supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) { }
    this.supportsPassive = supportsPassive;
    this.passiveEv = this.supportsPassive ? {passive: false }: false;
    this.prevTime = new Date().getTime();
  }
  subscribe(fn) {
    if (typeof fn !== 'function') throw new Error('handler must be function')
    this._listeners.push(fn);
    return () => {
      for (var i = this._listeners.length - 1; i >= 0; i--) {
        if (this._listeners[i] === fn) {
          return this._listeners.splice(i, 1);
        }
      }
    }
  }
  init() {
    if (document.onmousewheel !== undefined) {
      this.unMouseScroll = addEvent(document, 'mousewheel', this.mouseScroll.bind(this), this.passiveEv)
    } else {
      this.unMouseScroll = addEvent(document, 'DOMMouseScroll', this.mouseScroll.bind(this), this.passiveEv)
    }
  }
  destroyed() {
    this.unMouseScroll && this.unMouseScroll();
    this.unTouchStart && this.unTouchStart();
  }
  canChange() {
    this._canChange = true;
  }
  setCanChange(bool) {
    this._canChange = bool;
  }
  touchstart(e) {
    this.touchstartPosition = e.changedTouches[0].clientY;
    this.touchstartTime = now();
    this.untouchmove = addEvent(document, 'touchmove', this.touchmove.bind(this));
    this.untouchend = addEvent(document, 'touchend', this.touchend.bind(this))
  }
  touchmove(e) {
    var currentTime = now();
    this.eslaped = currentTime - this.touchstartTime;
    if (this.eslaped > 200) {
      this.touchstartPosition = e.changedTouches[0].clientY;
      this.touchstartTime = currentTime;
      this.distance = 0;
    } else {
      this.distance = e.changedTouches[0].clientY - this.touchstartPosition;
    }
  }
  touchend(e) {
    this.untouchend();
    this.untouchmove();
    let speed = this.distance / this.eslaped * 1000;
    console.log(speed)
    if (this._canChange) {
      if (Math.abs(speed) > 400) {
        if (speed < 0) {
          this.changeStage(1);
        } else {
          this.changeStage(-1);
        }
      }
    }
  }
  mouseScroll(e) {
    e.preventDefault();
    var curTime = new Date().getTime();
    e = e || window.event;
    var value = e.wheelDelta || -e.deltaY || -e.detail;
    var delta = Math.max(-1, Math.min(1, value));
    if (this._wheelDeltas.length > 149) {
      this._wheelDeltas.shift();
    }
    this._wheelDeltas.push(Math.abs(value));
    var timeDiff = curTime - this.prevTime;
    this.prevTime = curTime;
    if (timeDiff > 200) {
      // this._canChange = true;
      this._wheelDeltas = [];
    }
    if (this._canChange) {
      var averageEnd = getItemsAverage(this._wheelDeltas, 10);
      var averageMiddle = getItemsAverage(this._wheelDeltas, 70);
      var isAccelerating = averageEnd >= averageMiddle;
      if (isAccelerating) {
        if (delta < 0) {
          this.changeStage(1);
        } else {
          this.changeStage(-1);
        }
      }
    }
    return false;
  }
  iterator(...args) {
    return f => f(...args);
  }
  changeStage(c) {
    this.currentIndex += c;
    var next = c === 1 ? true : false;
    var canChange = () => {
      this.canChange();
    }
    this._canChange = false;
    if (!this.loop && !this.infinity) {
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
        this._canChange = true;
        return this._listeners.forEach(f => f(canChange, this.currentIndex, next, 'top')); // 到达最顶部
      }
      if (this.currentIndex >= this.pages) {
        this.currentIndex = this.pages - 1;
        this._canChange = true;
        return this._listeners.forEach(f => f(canChange, this.currentIndex, next, 'bottom')); // 到达最底部
      }
    }
    if (this.loop) {
      this.currentIndex = (this.currentIndex + this.pages - 1) % (this.pages);
    }
    this._listeners.forEach(f => f(canChange, this.currentIndex, next));
    console.log(c == 1 ? '下一页' : '上一页');
  }
  resetScroll() {
    this.scrollProcess = 0;
  }
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