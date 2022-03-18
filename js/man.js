
function Man(opt){

	this.man = new THREE.Object3D();
	this.pos = opt.pos;

	this.r = 2; // 头部半径大小
	this.bd_h = 7; // 身体的高度

	this.baseSpeedx = 1; //基数速度X，按下时间越长，基数越大
	this.baseSpeedy = 1; //基数速度Y，按下时间越长，基数越大

	this.sclae = 1;
	this.init();
}

Man.prototype.init = function(){

	this.man.position.z = this.pos.z;

	this.life = true; //生命  

	this.first_flag = false;

	this.y = this.prey;

	this.ready_flag = false; //预备动作

	this.target_s = 0;
	this.result = false;

	this.t = 0 ; // 回落到水平位置所需时间 
	this.time = 0;

	this.rotate_flag = false;
	this.deg = 0; //旋转角度

	this.speedX = .18;
	this.speedY = 4.5;

	this.g = -.4;
	this.b_h = 0; //底座下压的距离

}


Man.prototype.create = function(){
	//头部
	var sphereGeometry = new THREE.SphereGeometry(this.r, 30, 30);

	var sphereMaterial = new THREE.MeshLambertMaterial({
		color : new THREE.Color('#551111')
	});

	this.hd = new THREE.Mesh(sphereGeometry, sphereMaterial);

	this.hd.position.set( 0 , 0 , this.bd_h + 3.5 - 5 );

	this.man.add( this.hd );

	//身体
	var cylinderGeometry = new THREE.CylinderGeometry( this.r , this.r * 1.3 , this.bd_h , 30 );

	this.bd = new THREE.Mesh(cylinderGeometry, sphereMaterial);
	this.bd.rotation.x = 90 * Math.PI / 180;

	// add the sphere to the scene
	this.bd.position.set( 0 , 0 , this.bd_h/2 -5 );

	this.man.add( this.bd );
	this.man.position.set( this.pos.x, this.pos.y, this.pos.z  );

	return this.man;
}

Man.prototype.ready = function( ){

	this.baseSpeedx += .2;

	this.baseSpeedy += 0.005;

	if ( this.bd.scale.y <= 0.6  ){
		return;
	}

	this.ready_flag = true;

	this.bd.scale.y -= 0.0054;
	this.bd.scale.x += 0.0054;
	this.bd.scale.z += 0.0054;

	this.bd.position.z -= 0.03;

	this.bd.position.z = this.bd.position.z < 2.1-5 ? 2.1-5 : this.bd.position.z;

	this.hd.position.z -= 0.06;

	this.hd.position.z = this.hd.position.z < 6.3-5 ? 6.3-5 : this.hd.position.z;
	// this.height = this.width * 3.1;
}

Man.prototype.jump = function(){
	//速度控制 X Y 
	this.speedX *= this.baseSpeedx;
	this.speedY *= this.baseSpeedy;

	//进来第一次算出回到水平位置 X的距离
	if(!this.first_flag){
		// console.log(this.speedY  )
		this.first_flag = true;

		this.t = Math.floor(-2 * this.speedY / this.g) - 1 ;  //一开始底座没有下压的时间

		// this.t = Math.floor((-this.speedY + Math.sqrt( this.speedY * this.speedY + 2 * this.g * this.b_h )) / this.g);
	
		if (this.factor) {
			console.log('--------------11111111--------------')
			const plus = this.factor_deg < 0 ? 1 : -1;
			this.target_s1 = plus * (this.t ) * this.speedX * Math.cos( this.factor_deg ) + this.man.position.y ;
			this.target_s2 = (this.t ) * this.speedX * -( Math.abs( Math.sin( this.factor_deg ))) + this.man.position.x ;
		} else {
			console.log('--------------22222222--------------')
			const plus = this.factor_deg > 0 ? 1 : -1;
			this.target_s1 = (this.t ) * this.speedX * Math.cos( this.factor_deg ) + this.man.position.y ;
			this.target_s2 = plus * (this.t ) * this.speedX * ( Math.abs( Math.sin( this.factor_deg ))) + this.man.position.x ;
		}
	}

	console.log( this.time, this.t, this.target_s2, this.target_s1, this.man.position, 'this.factor: ' + this.factor,
		'this.factor_deg: ' + this.factor_deg
	)
	if( this.time >= this.t && this.land ){

		//着落 数据重置初始化
		setTimeout(function(){
			this.first_flag1 = false;
			this.land = false;
			console.log('跳动已经结束')
		}.bind(this),60)

		this.init();

		this.man.position.x = this.target_s2;
		this.man.position.y = this.target_s1;
		console.log( this.time, this.t, this.target_s2, this.target_s1, this.man.position )
		return;
	}

	if( this.result ){
		this.man.position.y += this.speedX * Math.cos(this.factor_deg);
		this.man.position.x += this.speedX * Math.abs(Math.sin(this.factor_deg));
	}

	if( this.man.position.z + this.speedY <= 5){
		this.man.position.z = 5; 
		return;
	}

	this.time++;

	if( this.factor ){  //factor 当前方向
		this.man.position.x -= this.speedX * Math.abs(Math.sin(this.factor_deg)) ;
		console.log('factor_deg', this.factor_deg )

		if ( this.factor_deg > 0 ){
			this.man.position.y -= this.speedX * Math.cos(this.factor_deg) ;
		} else {
			this.man.position.y += this.speedX * Math.cos(this.factor_deg) ;
		}

	} else {

		this.man.position.y += this.speedX * Math.cos(this.factor_deg) ;
		this.man.position.x += this.speedX *Math.sin(this.factor_deg) ;
	}

	this.speedY+= this.g;

	this.man.position.z += this.speedY; 

	// console.log( this.man.position.x , this.man.position.x, this.man.position.z )

	this.baseSpeedx = 1;
	this.baseSpeedy = 1;

		//物体旋转360
		
	if( this.factor ){
		this.deg += 18;

		if(this.deg >= 360){
			this.deg = 360;
		}
	}else{
		this.deg -= 18;

		if(this.deg <= -360){
			this.deg = -360;
		}
	}

	this.man.rotation.x = this.deg * Math.PI / 180;

	//物体恢复
	if(this.bd.scale.y >= 1 ){
		this.bd.scale.set( 1,1,1);
		this.bd.position.z = this.bd_h/2 -5 ;
		this.hd.position.z = this.bd_h + 3.5 -5;
		return;
	}
	this.bd.scale.y += 0.0108;
	this.bd.scale.x -= 0.0108;
	this.bd.scale.z -= 0.0108;

	// console.log( this.bd.scale )

	this.bd.position.z += 0.06;

	this.bd.position.z = this.bd.position.z > this.bd_h/2 -5 ? this.bd_h/2 -5 : this.bd.position.z;

	this.hd.position.z += 0.12;

	this.hd.position.z = this.hd.position.z > this.bd_h + 3.5 -5 ? this.bd_h + 3.5 -5 : this.hd.position.z;
}

