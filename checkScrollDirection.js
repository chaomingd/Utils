function checkScrollDirection(dir,window) {
	if (window.innerWidth < 854) return;
	if (!this.direction) {
		this.direction = dir;
	}
	clearTimeout(this.timer);
	this.timer = setTimeout(() => {
		this.direction = '';
	}, 300)
	if (this.direction !== dir) {
		return false;
	}
	return true;
}
