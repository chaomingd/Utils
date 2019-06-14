const EventEmit = require('events')

class UtilAsync extends EventEmit {
	constructor(tasks,limit,delay) {
		super();
		this.checkTaskType(tasks);
		this.tasks = [];  // 任务队列
		this.limit = limit || 5;  //最大并发数
		this.iteratee = () => {}; // 遍历器
		this.callback = this.callback.bind(this); // 完成一个时的回调
		this.count = 0;
		this.result = [];
		this.errs = [];
		this.doing = [];
		this.state = false;
		this.index = -1;
		this.delay = delay || 0;
		this.initTasks(tasks)
	}
	initTasks(tasks) {
		tasks.forEach(task => {
			this.tasks.push(task)
		})
	}
	add(task) {
		if(task === undefined || null) return;
		this.tasks.push(task)
	}
	remove(task) {
		if(task === undefined || null) return;
		this.tasks.splice(this.tasks.indexOf(task),1);
	}
	checkTaskType(tasks) {
		let TYPE = {}.toString.call([]);
		let type = {}.toString.call(tasks);
		if(type !== TYPE) throw new Error(`tasks must be an array not ${type.slice(8,type.length-1)}`)
	}
	getDoing() {
		return this.doing;
	}
	getWaiting(...args) {
		return this.tasks.slice(...args);
	}
	getTotalLength() {
		return this.doing.length + this.tasks.length;
	}
	update() {
		if(!this.state) return;
		let current = this.doing.length;
		if(current === this.limit) return;
		let count = Math.min(this.limit - current,this.tasks.length);
		if(count <= 0) return;
		for(let i = 0;i < count;i ++) {
			let task = this.tasks.shift();
			this.doing.push(task);
			this.iteratee(task,this.callback)
		}
		this.emit('taskstart',this.doing,this.tasks)
	}
	stopOne(task,cb) {
		let index = this.doing.indexOf(task);
		if(index === -1) return;
		cb && cb();
		this.doing.splice(index,1);
		this.tasks.unshift(task)
	}
	startOne(task,cb) {
		let index = this.tasks.indexOf(task);
		if(index === -1) return;
		this.tasks.splice(index,1);
		if(this.doing.length === 5) { // 队列中已有5个并发下载  把当前任务排到最前
			this.tasks.unshift(task);
			return;
		};
		cb && cb();
		this.doing.push(task); // 添加到下载队列
		this.iteratee(task,this.callback); // 下载下一个
		this.emit('taskchange')
	}
	start(iteratee) {
		if(this.state) return;
		this.state = true;
		this.iteratee = iteratee;
		let len = this.limit;
		if(this.tasks.length < this.limit){
			len = this.tasks.length;
		}
		for(let i = 0;i < len;i ++) {
			let task = this.tasks.shift();
			this.index ++;
			this.doing.push(task);
			iteratee(task,this.callback)
		}
		this.emit('taskstart',this.doing,this.tasks)
	}
	callback(lastItem,result) {
		this.emit('taskfinish',lastItem)
		if(result) {
			if(result instanceof Error) {
				this.errs.push(result);
				this.emit('error',result)
			}else {
				this.result.push(result)
			}
		}
		let index = this.doing.indexOf(lastItem);
		this.doing.splice(index,1);
		lastItem = null;
		let task = this.tasks.shift();
		if(!task){
			if(this.doing.length === 0) {
				this.emit('complete',this.errs,this.result);
				this.state = false;
				this.index = -1;
			}
			return;
		}
		setTimeout(() => {
			this.index ++;
			this.doing.push(task);
			this.iteratee(task,this.callback)
			this.emit('taskstart',this.doing,this.tasks)
		});
	}
}

/**  usage
 * function test(i) {
	return new Promise((resolve,reject) => {
		setTimeout(() => {
			resolve(i)
		},Math.floor(Math.random() * 10) * 1000);
	})
}


var tasks = [];
for(var i =0;i < 100;i ++) {
	tasks.push('i' + i)
}

var utilAsync = new UtilAsync(tasks,5);
utilAsync.start(async (task,callback) => {
	try {
		await test(task);
		// console.log(task);
		callback(task,result = 'true')
	}catch(e) {
		callback(task,e);
	}
});
utilAsync.on('complete',(errs,results) => {
	console.log(errs,results)
})

utilAsync.on('taskstart',(doing,waiting) => {
	// console.log(doing);
})
utilAsync.on('taskFinish',(doing,waiting) => {
	console.log(doing);
})
 */




module.exports = UtilAsync;