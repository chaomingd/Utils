
var httpReg = /^(https?)\:\/\/(?:(\w+(?:\.\w+)?)\:(\w+(?:\.\w+)?)@)?([^?#/]+)?(\/[^?#]+)?(\?[^#]+)?(\#[\s\S]+)?$/;
var url = 'https://leon.zeng:happycm@www.baidu.com/test/test1?k=test#test';


console.log(url.match(httpReg))