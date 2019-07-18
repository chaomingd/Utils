window.addEventListener('DOMContentLoaded',function () {
	var canvas=document.getElementById("canvas");
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	var ipt1=document.getElementById("ipt1");
	var cxt=canvas.getContext("2d");
	var imgData,pointsArr=[],colorArr=[],allData=[];


	// 用离屏canvas
	backCanvas=document.createElement("canvas");
	backCanvas.width=canvas.width;
	backCanvas.height=canvas.height;
	backCanvasCtx=backCanvas.getContext('2d');


	Dot=function (x,y) {
		var color=Math.floor(Math.random()*156);
		var color1=Math.floor(Math.random()*256);
		var color2=Math.floor(Math.random()*250);
		this.sx=x;
		this.sy=y;
		this.radius=2;
		this.dx=Math.random()*window.innerWidth;
		this.dy=Math.random()*window.innerHeight;
		this.color='rgba('+color+','+color1+','+color2+')';
		// 当前帧
		this.curFrame=0;
		// 总帧数
		this.frameCount=100;

	}

	var obj={
		aniId: null,
		/**
		 * 写文字
		 * @param txt
		 * @param size
		 */
		showText: function (txt,size) {
			backCanvasCtx.textAlign='center';
			backCanvasCtx.textBaseline='middle';
			backCanvasCtx.save();
			backCanvasCtx.font=size+'px ripple';
			backCanvasCtx.fillStyle='#f00';
			backCanvasCtx.fillText(txt,canvas.width/2,canvas.height/2);
			backCanvasCtx.restore();

		},
		getPoints: function () {
			var that=this;
			var points=[];
			var imgData=backCanvasCtx.getImageData(0,0,canvas.width,canvas.height);
			var pixelData=imgData.data;
			for (var nh=0;nh<backCanvas.height;nh+=5) {
				for (var nw=0;nw<backCanvas.width;nw+=5) {
					// 括号内是求出对应位置；*4是像素位置 数组每四个值是一个像素点
					var num=(nh*backCanvas.width+nw)*4;
					if (pixelData[num]!=0) {
						points.push(new Dot(nw,nh));
					}
				}
			}
			return points;

		},
		/**
		 * 显示粒子
		 */
		showLizi: function (v,size) {
			var that=this;
			that.finishCount=0;
			cxt.clearRect(0,0,canvas.width,canvas.height);
			backCanvasCtx.clearRect(0,0,canvas.width,canvas.height);
			// 1.在离屏上写红色的字并上下左右居中
			// 2.像素化文字(用任一颜色吧)
			// 3.将其显示到主屏上（找到像素对应坐标，用圆点表示出来）
			that.showText(v,size);
			that.pointList=this.getPoints();
			that.drawDot();

		},
		finishCount: 0,
		//tween 动画效果
		/**
		 *
		 * @param 当前帧
		 * @param 开始位置
		 * @param 结束位置
		 * @param 总共帧数
		 * @returns 返回当前帧所在的坐标
		 */
		linear: function (t,b,c,d) {
			return c*t/d+b;
		},
		pointList: [],
		drawDot: function () {
			var that=obj;
			cxt.clearRect(0,0,canvas.width,canvas.height);
			for (var k=0;k<that.pointList.length;k++) {

				var curDot=that.pointList[k];
				cxt.save();
				cxt.beginPath();

				cxt.fillStyle=curDot.color;

				if (curDot.curFrame<curDot.frameCount) {
					var x=that.linear(curDot.curFrame,curDot.dx,curDot.sx-curDot.dx,curDot.frameCount);
					var y=that.linear(curDot.curFrame,curDot.dy,curDot.sy-curDot.dy,curDot.frameCount);
					cxt.arc(x,y,curDot.radius,0,2*Math.PI,false);
					curDot.curFrame++;
				} else {
					cxt.arc(curDot.sx,curDot.sy,curDot.radius,0,2*Math.PI,false);
					that.finishCount++;
				}
				cxt.fill();
				cxt.restore();

			}
			if (that.finishCount>=that.pointList.length) {
				cancelAnimationFrame(that.aniId);
				//                clearInterval(that.aniId);
				return;
			}



			that.aniId=requestAnimationFrame(that.drawDot);


		}

	};



	//    obj.aniId=setInterval(obj.drawDot,20);



	// 默认画面显示hello world
	obj.showLizi('你好，再见。',160);

	// 按钮操作
	ipt1.onkeyup=function (e) {

		if (e.keyCode==13) {
			var v=ipt1.value;
			if (!v) {
				alert('请输入文字');
				return;
			}
			obj.showLizi(v,100);


		}

	};
})

function filterImage(ctx,imageData) {
	var w=imageData.width;
	var h=imageData.height;
	var imgData=imageData.data;
	var blurR=3;
	var count=(2*blurR+1)*(2*blurR+1);
	for (var r=0;r<h;r++) {
		for (var c=0;c<w;c++) {
			var totalR=0,totalG=0,totalB=0;
			for (var i=-blurR;i<=blurR;i++) {
				for (var j=-blurR;j<=blurR;j++) {
					var aroundPoint=(r+i)*w+(c+j);
					totalR+=imgData[4*aroundPoint+0];
					totalG+=imgData[4*aroundPoint+1];
					totalB+=imgData[4*aroundPoint+2];
				}
			}
			var p=r*w+c;
			imgData[4*p+0]=totalR/count;
			imgData[4*p+1]=totalG/count;
			imgData[4*p+2]=totalB/count;
		}
	}
	ctx.putImageData(imageData,0,0);
}