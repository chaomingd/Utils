if (document.onmousewheel !== undefined){
	document.addEventListener('mousewheel', mouseScroll,{passive: false});
}else {
	document.addEventListener('DOMMouseScroll',mouseScroll,{passive: false});
}

let deltaLength = 30;

function mouseScroll() {
	if(!this.showPreventDefault) return;
	let ev = e || window.event
	ev.preventDefault(); 
	let delta = (ev.wheelDelta / 120) || (-ev.detail / 3)
	//scroll without smoothing 
	window.scrollTo(0, currentScrollPosition - delta * deltaLength); 
}