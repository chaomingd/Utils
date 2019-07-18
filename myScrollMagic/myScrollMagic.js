function ScrollMagic() {
	if((this instanceof ScrollMagic)) {
		throw new TypeError("Cannot new a base function");
	}
}

function Controller() {
	this._Scenes = [];
}

function Scene(options) {
	let state = {
		scrollState: 'leave',
		scrollDirection: '',
		progress: 0,
	}
	let defaultOptions = {
		duration: 0,
		offset: 0,
		triggerHook: 0,
	}
	let Op = Object.assign(defaultOptions,options);
	if(!Op.triggerElement) {
		throw new Error('triggerElement must be a node element');
	}
	if(Op.triggerElement.nodeType !== 1) {
		throw new Error('triggerElement must be node element');
	}
}

Scene({duration: 1,offset: 12})