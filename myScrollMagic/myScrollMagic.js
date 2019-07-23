import EventEmitter from 'events'
import { _inherits,addEvent,getElRect } from './util';
import styler from 'stylefire'

_inherits(Scene,EventEmitter)

function ScrollMagic() {
	if ((this instanceof ScrollMagic)) {
		throw new TypeError("Cannot new a base function");
	}
}
ScrollMagic.Controller = Controller;
ScrollMagic.Scene = Scene;

function Controller() {
	this._containers=[];
	this._scens=[];
}
Controller.prototype.addScrollEvent=function (containerElement,fn) {
	return addEvent(containerElement,'scroll',fn)
}

function Scene(options) {
	this.minBoundaryValue=0;
	this._lastRectValue=0;
	this._scrollDestory=null;
	this._parentNode = null;
	this._parentNodeStyler = null;
	this._isPin = false;
	this._showUpdatePin = true; // 是否更新pin
	this._pinLeft = 0; // fixed定位时的left值
	this.state={
		scrollState: '',
		scrollDirection: '',
		progress: 0,
	}
	let defaultOptions={
		duration: 0,
		offset: 0,
		triggerHook: 0,
		direction: 'vertical',
		alwaysGetElementPostion: false,
	}
	var Op=this.Op=Object.assign(defaultOptions,options);
	if (!Op.triggerElement) {
		throw new Error('triggerElement must be a node element');
	}
	if (Op.triggerElement.nodeType!==1) {
		throw new Error('triggerElement must be node element');
	}
	this.triggerElement=Op.triggerElement;
	this.setBoundaryValue();
	this.update=this.update.bind(this);
	this.addEvent();
}

Scene.prototype.addEvent = function() {
	this.on('enter',this._enter,this);
	this.on('leave',this._leave,this);
}

Scene.prototype.update=function () {
	var triggerElementRect=getElRect(this.triggerElement);
	var rectValue=this.Op.direction==='vertical'? triggerElementRect.top:triggerElementRect.left;
	if (this._lastRectValue<rectValue) {
		this.state.scrollDirection='down';
	} else {
		this.state.scrollDirection='up';
	}
	var minBoundaryValue=this.minBoundaryValue;
	if (this.Op.duration===0) {  // 两个区间 < minBoundaryValue or > minBoundaryValue
		if (rectValue<=minBoundaryValue) {
			if (this.state.scrollState!=='enter') {
				this.state.scrollState='enter'
				this.state.progress=1;
				this._showUpdatePin = true;
				this.emit('enter');
				this.emit('progress',this.statetoEvent())
			}
		} else {
			if (this.state.scrollState==='enter') {
				this.state.scrollState='leave';
				this.state.progress=0;
				this._showUpdatePin = true;
				this.emit('leave');
				this.emit('progress',this.statetoEvent())
			}
		}
	} else {
		if ((rectValue<=minBoundaryValue)&&(rectValue>=this.maxBoundaryValue)) {
			// 三个区间 < minBoundaryValue or minBoundaryValue~maxBoundaryValue or > maxBoundaryValue
			this.state.progress=(minBoundaryValue-rectValue)/this.Op.duration;
			if (this.state.scrollState!=='enter') {
				this.state.scrollState='enter'
				this._showUpdatePin = true;
				this.emit('enter');
			}
			this.emit('progress',this.statetoEvent());
		} else if (rectValue<this.maxBoundaryValue) {
			if (this.state.progress===0) {
				if (this.state.scrollState!=='enter') {
					this.state.scrollState='enter'
					this._showUpdatePin = false;
					this.emit('enter');
				}
			}
			if (this.state.scrollState==='enter') {
				this.state.scrollState='leave'
				this.state.progress=1;
				this._showUpdatePin = true;
				this.emit('progress',this.statetoEvent())
				this.emit('leave');
			}
		}
		else if (rectValue>minBoundaryValue) {
			if (this.state.progress === 1) {
				if (this.state.scrollState!=='enter') {
					this.state.scrollState='enter'
					this._showUpdatePin = false;
					this.emit('enter');
				}
			}
			if (this.state.scrollState==='enter') {
				this.state.scrollState='leave'
				this.state.progress=0;
				this._showUpdatePin = true;
				this.emit('progress',this.statetoEvent());
				this.emit('leave');
			}
		}
	}
	this._lastRectValue=rectValue;
}

Scene.prototype.setBoundaryValue=function () {
	this.minBoundaryValue=window.innerHeight*this.Op.triggerHook+this.Op.offset;
	this.maxBoundaryValue=this.minBoundaryValue-this.Op.duration;
}

Scene.prototype.addTo=function (controller) {
	if (!(controller instanceof Controller)) {
		throw new TypeError('controller must be instance of Controller')
	}
	this.update();
	this.scrollDestory=controller.addScrollEvent(this.Op.container||window,this.update);
	return this;
}

Scene.prototype.destory=function () {
	this._scrollDestory&&this._scrollDestory();
	this.scrollDestory=null;
}

Scene.prototype.setPin = function (el) {
	if(this._isPin) return;
	this.el = el;
	this._parentNode = el.parentNode;
	this._parentNodeStyler = styler(this._parentNode);
	this._elStyler = styler(this.el);
	this._pinLeft = getElRect(this._parentNode).left;
	this.updateParentNode();
	this.update();
	this.updatePin();
	this._isPin = true;
}
Scene.prototype.updateParentNode = function() {
	let elRect = getElRect(this.el);
	this._parentNodeStyler.set({
		position: 'relative',
		height: elRect.height + this.Op.duration,
	})
	this._parentNodeStyler.render();
}

Scene.prototype.updatePin = function() {
	if(this.Op.duration === 0) {
		return this.updatePinNoDuration();
	}
	this.updatePinWithDuration();
}

Scene.prototype.updateScene = function(options) {

}

Scene.prototype.removePin = function() {
	if(!this._isPin) return;
	this._isPin = false;
}

Scene.prototype.updatePinNoDuration = function() {
	let progress = this.state.progress;
	if(progress === 1) {
		this._elStyler.set({
			position: 'fixed',
			top: this.minBoundaryValue,
			left: this._pinLeft,
			right: 'auto',
			bottom: 'auto',
			width: getElRect(this._parentNode).width
		})
	}else {
		this._elStyler.set({
			position: 'absolute',
			top: 0,
			left: 0,
			right: 'auto',
			bottom: 'auto'
		})
	}
}

Scene.prototype.updatePinWithDuration = function() {
	let progress = this.state.progress;
	if(progress === 0) {
		this._elStyler.set({
			position: 'absolute',
			top: 0,
			left: 0,
			right: 'auto',
			bottom: 'auto'
		})
	}else if(progress === 1){
		this._elStyler.set({
			position: 'absolute',
			top: 'auto',
			left: 0,
			right: 'auto',
			bottom: 0
		})
	}else {
		this._elStyler.set({
			position: 'fixed',
			top: this.minBoundaryValue,
			left: this._pinLeft,
			right: 'auto',
			bottom: 'auto',
			width: getElRect(this._parentNode).width
		})
	}
}

Scene.prototype.statetoEvent=function () {
	return Object.assign({},this.state);
}

Scene.prototype._enter=function () {
	if(!this._isPin || !this._showUpdatePin) return;
	this.updatePin();
}
Scene.prototype._leave=function () {
	if(!this._isPin) return;
	this.updatePin();
}

export default ScrollMagic;
export {
	EventEmitter,
	styler,
}