
var uInt8Array = new Uint8Array(1024*1024*32); // 32MB
for (var i = 0; i < uInt8Array .length; ++i) {
  uInt8Array[i] = i;
}

console.log(uInt8Array.length); // 传递前长度:33554432

var myTask = `
    onmessage = function (e) {
        var data = e.data;
        data[0] = 255
        console.log('worker:', data[0]);
        postMessage(data);
    };
`;

var blob = new Blob([myTask]);
var myWorker = new Worker(window.URL.createObjectURL(blob));
myWorker.postMessage(uInt8Array);
myWorker.onmessage = e => {
  console.log(e.data.length)
  // const data = e.data;
  // console.log('onmessage: data', data[0])
}
console.log(uInt8Array.length); // 传递后长度:0