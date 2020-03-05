function isFullScreen() {
	return !!(
		document.fullscreen ||
		document.mozFullScreen ||
		document.webkitIsFullScreen ||
		document.webkitFullScreen ||
		document.msFullScreen
	);
}
function isFullscreenEnabled() {
	return (
		document.fullscreenEnabled ||
		document.mozFullScreenEnabled ||
		document.webkitFullscreenEnabled ||
		document.msFullscreenEnabled
	);
}
function getFullscreenElement() {
	return (
		document.fullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullScreenElement ||
		document.webkitFullscreenElement || null
	);
}
function addEvent(el,type,fn) {
	el.addEventListener(type,fn)
	return () => {
		el.removeEventListener(type,fn);
	}
}
function exitFullscreen() {
	if (document.exitFullScreen) {
		document.exitFullScreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
}
function requestFullScreen(ele) {
	if (ele.requestFullscreen) {
		ele.requestFullscreen();
	} else if (ele.mozRequestFullScreen) {
		ele.mozRequestFullScreen();
	} else if (ele.webkitRequestFullscreen) {
		ele.webkitRequestFullscreen();
	} else if (ele.msRequestFullscreen) {
		ele.msRequestFullscreen();
	}
}