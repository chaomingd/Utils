import {EventEmiter} from './Util'

class Router extends EventEmiter {
	constructor(baseUrl = '') {
		super();
		this.state = {};
		this.baseUrl = baseUrl;
		this.currentUrl = window.location.pathname;
		this.lastUrl = this.currentUrl;
		window.addEventListener('popstate', (e) => {
			e.preventDefault();
			this.currentUrl = window.location.pathname;
			this.emit('historychange',window.location.pathname,this.state);
			this.emit('popstate',window.location.pathname,this.state);
			this.lastUrl = this.currentUrl;
		});
	}
	push(path,state = {}) {
		window.history.pushState(state,'',this.baseUrl + path);
		this.state = {...this.state,...state};
		this.currentUrl = this.baseUrl + path;
		this.emit('historychange',this.currentUrl,this.state);
		this.lastUrl = this.currentUrl;
	}
	replace(path,state = {}) {
		window.history.replaceState(state,'',this.baseUrl + path);
		this.state = {...this.state,...state};
		this.currentUrl = this.baseUrl + path;
		this.emit('historychange',this.currentUrl,this.state);
		this.lastUrl = this.currentUrl;
	}
}

export default Router;