import TWEEN from '@tweenjs/tween.js'

function scrollTo(pos, callback) {
	if (typeof pos !== 'number') return;
	let position = { pos: getScrollTop() }
	let tween = new TWEEN.Tween(position)
		.to({ pos: pos }, 800)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(() => {
			window.scrollTo(0, position.pos)
		})
		.onComplete(() => {
			callback && callback();
		});
	tween.start();
	function animate(time) {
		var id = requestAnimationFrame(animate);
		var result = TWEEN.update(time);
		if (!result) cancelAnimationFrame(id);
	}
	animate();
}

export default scrollTo;