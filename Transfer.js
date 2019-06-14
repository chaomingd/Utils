const request = require('request');
const EventEmitter = require('events');
const path = require('path')
const { UPLOAD,getToken,DOWNLOADURL } = require('../../config/config')
const fs = require('fs');
const url = require('url');
const resolveFileInfo = require('./resolveFileInfo');
const uuidv4=require('uuid/v4');
const fs_promise = require('../utils/fs')
const process = require('process')

class Transfer extends EventEmitter {
	constructor(pageInfo){
		super();
		this.start = 0;
		this.total = 0;
		this.pause = true;
		this.File = pageInfo;
		this.pageInfo = pageInfo;
		this.pageInfo.id = uuidv4().replace(/-/g,'');
		this.pageInfo.oldName = pageInfo.name;
		this.pageInfo.name = `${pageInfo.name}-${pageInfo.type}${pageInfo.page? '-page' + pageInfo.page: ''}`;
		this.pageInfo.real_path = path.resolve(UPLOAD,pageInfo.excelName,pageInfo.dir,pageInfo.name);
		this.received = this.start;
		this.socket = undefined; // socket
		this.complete = false; // transfer is complete
		this.hasAborted = false;
		this.destroyed = false;
	}
	fileterFileToClient(File) {
		let showkeys = ['id','file_size','real_path','url','createTime','name'];
		let clientFile = {};
		showkeys.forEach(key => {
			clientFile[key] = File[key];
		})
		return clientFile;
	}
	startDownload(start) {
		if(!this.pause) return;
		this.pause = false;
		this.start = start || this.start;
		this.received = this.start;
		this.complete = false;
		if(this.File.keysJson) {
			this.FileStream = fs.createWriteStream(this.File.real_path,{start: this.start,flags: this.start>0?'r+':'w'})
			this.download()
			return;
		}
		fs_promise.mkdir(path.resolve(UPLOAD,this.pageInfo.excelName,this.pageInfo.dir)).then(() => {
			return resolveFileInfo(this.pageInfo,this)
		})
		.then(file => { // 解析文件信息
			this.File = file;
			this.total = file.file_size;
			this.FileStream = 
			fs.createWriteStream(this.File.real_path,{start: this.start,flags: this.start>0?'r+':'w'})
			this.FileStream.on('error',(e) => {
				console.error(e);
				console.log('写入失败')
				this.destroy();
				this.emit('error',e);
			})
			this.download()
		})
		.catch(e => {
			console.log('errorr ------ transfer')
			console.error(e);
			this.emit('resolveFileErr',e,this.received);
			this.destroy();
		})
	}
	stopDownload() {
		this.req && this.req.abort();
		this.pause = true;
		this.complete = false;
	}
	puaseDownload() {
		if(this.pause) return;
		this.pause = true;
		this.socket && this.socket.pause();
		this.complete = false;
		this.emit('pause',this.received)
	}
	abortDownload() {
		this.req && this.req.abort();
		this.hasAborted = true;
		console.log(this.received + 'close or abort')
		this.emit('aborted',this.received)
		this.complete = false;
		this.destroy();
	}
	resumeDownload() {
		if(!this.pause) return;
		this.pause = false;
		this.socket && this.socket.resume();
		this.emit('resume',this.received);
		this.complete = false;
	}
	destroy() {
		if(this.FileStream) {
			this.destroy = true;
			this.FileStream.destroy();
		}
	}
	download() {
		let formData = this.File.keysJson;
		let pageInfo = this.pageInfo;
		console.log(pageInfo.url)
		this.downloadUrl = DOWNLOADURL + `?filename=download.zip&theRing=${getToken()}`;
		console.log(this.downloadUrl)
		this.req = request(this.downloadUrl,{
			method: 'post',
			hostname: url.parse(this.downloadUrl).hostname,
			form: {
				keysJson: formData
			},
			headers: {
				Range: `bytes=${this.start}-${this.total - 1}`,
				Origin: 'https://vandam.netflix.com',
				Referer: pageInfo.url,
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			},
			timeout: 20 * 1000,
		})
		.on('socket',socket => {
			this.socket = socket;
		})
		.on('error',(err) => {
			console.error(err);
			if(this.hasAborted) return;
			this.emit('error',err,this.received)
			this.destroy();
		})
		.on('complete',() => {
			this.FileStream.end();
				this.FileStream.once('finish',() => {
				console.log('done')
				this.emit('complete',this.received)
				this.destroy();
				this.FileStream = null;
				this.complete = true;
			})
		})
		.on('response',(res) => {
			console.log(res.statusCode)
			if(res.statusCode >= 400) {
				this.destroy();
				let err = new Error(res.statusMessage)
				console.error(err);
				this.emit('error',err,this.received);
				return;
			}
			res.on('error',(err) => {
				console.error(err)
				if(this.hasAborted) return;
				this.emit('error',err,this.received)
				this.destroy();
			})
			.on('data',(data) => {
				this.received += data.length;
				if(this.destroyed) return;
				this.FileStream.write(data);
				this.emit('progress',this.received / this.total * 100,this.received)
			})
		})
	}
}

module.exports = Transfer;