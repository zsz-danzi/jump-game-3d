  
  //图片图像的初始化
  function Yuan(x,y,url){
	this.x = x;
	this.y = y;
	this.img = new Image();
	this.img.src = url;   
  }
  
  Yuan.prototype.draw = function(paint){ 
	paint.save();
	paint.drawImage(this.img,this.x,this.y)   
	paint.restore(); 
  }

  Yuan.prototype.ondraw = function(paint){
	 if(this.img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数  
		this.draw(paint);
		return; // 直接返回，不用再处理onload事件  
	 }  
	 var _this = this;	  
	 this.img.onload = function(){
		_this.draw(paint); 
	 }  	   
  }
  
  //继承
  function object(o){
	 var F = function(){};
	 F.prototype = o;
	 return new F();  
  }
  
  function inheritPrototype(obj1,obj2){ //obj2是超类型 obj1是子类型
	  var prototype = object(obj2.prototype);
	  prototype.constructor = obj1;
	  obj1.prototype = prototype;  
  }
  

   //屏幕上 下 左 右 在画布的位置
   function Yemian(){
	  this.L1 = 0;
	  this.R1 = 750;
	  this.T1 = 0;
	  this.B1 = 1334;     
   }
   var Page = new Yemian();