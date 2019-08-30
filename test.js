var str = 'https://www.baidu.com/?kw=xxxx';

var reg = /^(https?)\:\/\/([^/]+)(\/(?:[^?]+)?)(\?[^#]*)?(\#[\s\S]*)?/;

var reg = /^(?:(\w+(?:\.\w+)?)\:(\w+(?:\.\w+)?)@)$/
var result = reg.exec('leon.zeng:happycm@')
console.log(result)