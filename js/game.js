/*
 * @author:danzizhong;
 * @date:2018/03/17;
 * @content:game-tiaoyitiao-2D;
*/

var Game = function(){

	var cvs = gid('cvs');
	var btn = gid('btn-again');
	var p_num = gid('num');
	var index_num = 0;

	var W = 750;
	var H = 1334;

	var controls = null;

	//游戏属性
	var man = null,
		_this = null,
		// ctx = cvs.getContext('2d'),
		back_speed = 1.5, //物体向后移动速度
		block_arr = [], //块数组
		touch_flag = false, // 是否按下
		running_flag = false, //是否正在移动
		f_block_dis = 50, //第1块block位置距离屏幕50
		s_block_disy = 0, //第2块距离
		s_block_disx = 0, //第2块距离
		back_i = 0, // 后退时间
		distance = 0,
		first_flag = false,
		block_width = 100,
		game_over = false,
		block_index = 0,
		factor = false, //方向 X 或 Y
		block_id = 0 ; // 状态1 - 第1个block碰撞  2 - 第2个block  3 - 没有碰撞 做自由落体运动 


	function gid(v){
		return document.getElementById(v);
	}

    var stats = initStats();

    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.getElementById("Stats-output").appendChild(stats.domElement);

        return stats;
    }

	return {

		init : function(){

			_this = this;

	        this.scene = new THREE.Scene();

	        // create a render and set the size
	        this.renderer = new THREE.WebGLRenderer({
	        	alpha : true,
	        	antialias : true,
	        	preserveDrawingBuffer : true
	        });


	        this.renderer.setSize(W, H);

			var frustumSize = 150 ;   // 纵向视野
			var aspect = W / H;  // 纵横比
			this.camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2,  -200, 1000);  // 创建正交投影相机，具体参数和含义请参考官方文档

	        // this.camera = new THREE.OrthographicCamera( W / -16, W / 16, H / 16, H / -16, -200, 500);
			this.camera.position.set(-17, 30, 26);      // 设置相机位置

			this.camera.lookAt(new THREE.Vector3(13, 0, -4))   // 设置相机朝向

			this.scene.add(this.camera);    // 在场景中加入相机

            // this.camera.position.x = 120;
            // this.camera.position.y = 60;
            // this.camera.position.z = 180;
            // this.camera.lookAt(this.scene.position);

	       	//添加平行光
	        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
	        directionalLight.position.set(-20, 40, 60);
	        this.scene.add(directionalLight);

	        //添加环境光
	        var ambientLight = new THREE.AmbientLight(0xffffff,0.4);
	        this.scene.add(ambientLight);

	        cvs.appendChild(this.renderer.domElement);


	        //添加可以旋转镜头
	        controls = new THREE.TrackballControls( this.camera );
			controls.rotateSpeed = 1.0;
			controls.zoomSpeed = 1.2;
			controls.panSpeed = 0.8;
			controls.noZoom = false;
			controls.noPan = false;
			controls.staticMoving = true;
			controls.dynamicDampingFactor = 0.3;
			controls.keys = [ 65, 83, 68 ];
			// controls.addEventListener( 'change', _this.render );


	        // create the ground plane
	        var planeGeometry = new THREE.PlaneGeometry(400, 400);
	        var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
	        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);

	        this.plane.rotation.x = -90 * Math.PI / 180;  
	        this.plane.rotation.z = -90 * Math.PI / 180; 

	        this.plane.position.x = -40;
	        this.plane.position.y = 0;
	        this.plane.position.z = 30;

	        this.scene.add(this.plane);

	        //创建角色
	        man = new Man({
	        	pos : {
	        		x : 0,
	        		y : 0,
	        		z : 17
	        	}
	        });

	        this.plane.add( man.create() );


	       	//创建底座
	        var block = new Block({
	        	pos : {
	        		x : 0,
	        		y : 0,
	        		z : 0
	        	},
	        	size : {
	        		l : 20,
	        		w : 20,
	        		h : 12
	        	}
	        }); 


	        var b = block.create();
	        block_arr.push(b);

	        this.plane.add( b );

	        //把第二个坐标与第一个坐标形成的角度 和 方向传到man
			man.factor = factor;
			man.factor_deg = 0 *Math.PI/180; 

	        //创建第二个底座
	        var block1 = new Block({
	        	pos : {
	        		x : 0,
	        		y : 50,
	        		z : 0
	        	},
	        	size : {
	        		l : 20,
	        		w : 20,
	        		h : 12
	        	}
	        });
	        var b1 = block1.create();
	        block_arr.push(b1);

	        this.plane.add( b1 );
	        block1.drop();



			this.animate();
	
	        // btn.addEventListener('touchstart',function(ev){
	        // 	var ev = ev || event;
	        // 	ev.cancelBubble = true;
	        // 	return false;
	        // });

	        // btn.addEventListener('touchend',function(ev){
	        // 	var ev = ev || event;
	        // 	ev.cancelBubble = true;

	        // 	_this.reset();

	        // })

			document.addEventListener( 'touchstart', _this.onDocumentTouchStart.bind(_this), false );
	        document.addEventListener( 'touchmove', _this.onDocumentTouchMove.bind(_this), false );
	        document.addEventListener( 'touchend', _this.onDocumentTouchEnd.bind(_this), false );

		},

		reset : function(){

			//分数
			index_num = _this.toTwo(0) ;
			p_num.innerHTML = index_num;

			btn.style.display = 'none';

			_this.animate_stop =false;
			block_width = 100;

			block_arr = [];
			//创建人物
			man = new Man(110 , 1334 -100  , './img/tiao.png');
			man.draw(ctx);

			//创建地板
			var block = new Block(f_block_dis, 1334 - 100 , 120 );
			block.draw(ctx);
			block_arr.push(block);

			block = new Block(s_block_dis, 1334 - 100 );
			block.create();
			block_arr.push(block);

			this.animate();

		},

		//每一证的状态
		animate : function( time){

			stats.update();  //帧率
			TWEEN.update( time ); //twee动画
			controls.update();
			
			//逻辑
			if( man.life ){
				// if( man.y >= Page.B1 ){
				// 	game_over = true;
				// 	btn.style.display = 'block';
				// 	_this.stop();
				// }
				if( touch_flag ){
					man.ready();
				}else{
					if( man.ready_flag){

						man.jump();  //跳跃瞬间得出水平X的目标位置
						// block_arr[0].jump();

						//算物体的目标与底座是否碰撞
						if( !man.first_flag1 ){
							man.first_flag1 = true;
							for(var i=0; i<block_arr.length; i++){
								var bl = block_arr[i];

								if( _this.collision(man,bl)){

									block_id = i+1 ; //与第几个碰撞了
									if( block_id - block_index ==2 ){

										man.back_flag = true;
										block_index++;

									}

									man.land = true; //顺利降落

									console.log(333)

									break;
								}
							}
						}

						//算物体自身与底座是否碰撞
						if( !man.land ){
							for(var i=0; i<block_arr.length; i++){
								var bl = block_arr[i];
								result = _this.collision2(man.man,bl);

								man.result = result;
								if(result){
									if(result == 'right'){
										man.speedX = .1;
									}else if( result == 'left' ){
										man.speedX = -.1;
									}else if( result == 'bottom' ){
										man.speedX = .1;
									}else{
										man.speedX = -.1;
									}

									man.speedY = -.4 ;
									man.g = -0.2;
									break;
								}
							}
						}

					}else if( man.back_flag ){

						if(!first_flag){ //生成下一块

							first_flag = true;

							//判断方向
							factor = Math.random() > 0.5 ? true : false;

							distance = Math.abs( factor ?  block_arr[block_index].position.x : block_arr[block_index].position.y );

							if(  distance > 0 && factor ){
								distance += 5;
							}

							// var b_width = Math.ceil(Math.random() * 8) + 14;
							var b_width = 20;


							if( factor ){
								s_block_disx = block_arr[ block_index ].position.x - (Math.ceil(Math.random() * 20 ) + b_width + 10 ) ;
								s_block_disy = block_arr[ block_index ].position.y;
							}else{
								s_block_disx = block_arr[ block_index ].position.x;
								s_block_disy = Math.ceil(Math.random() * 20 ) + b_width + 10 + block_arr[ block_index ].position.y ;
							}


					        //把第二个坐标与第一个坐标形成的角度 和 方向传到man
							man.factor = factor;

							man.factor_deg = Math.atan(  (s_block_disx - man.man.position.x) / ( s_block_disy - man.man.position.y  ) ) ; 


							// man.curx = man.man.position.x;
							// man.cury = man.man.position.y;
							// man.target_x = s_block_disx;
							// man.target_y = s_block_disy;

					        //创建第二个底座
					        var block1 = new Block({
					        	pos : {
					        		x : s_block_disx,
					        		y : s_block_disy,
					        		z : 0
					        	},
					        	size : {
					        		l : b_width,
					        		w : b_width,
					        		h : 12
					        	}
					        });
					        var b1 = block1.create();
					        block_arr.push(b1);

					        this.plane.add( b1 );
					        block1.drop();


							//计分
							index_num++;
							p_num.innerHTML =_this.toTwo(index_num);


						}

						_this.moveMap( distance , function(){
							first_flag = false;
							back_speed = 1.5;
						} )

					}
				}

			}


			this.renderer.render(this.scene, this.camera);
			window.requestAnimationFrame( this.animate.bind(this) );

		},

		//暂停
		stop : function(){
			this.animate_stop = true;	
		},

		toTwo : function(num){
			return num < 10 ? '0' + num : num;
		},

		moveMap : function(distance,endFn){  //移动场景 - 第二块block移动到屏幕左边距离50的地方


			back_i++;

			if(back_i * back_speed >= distance) {

				man.back_flag = false;

				back_speed = distance - ((back_i -1) * back_speed);

				back_i = 0;
			}

			if( factor ){
				man.man.position.x += back_speed;
			}else{
				man.man.position.y -= back_speed;
			}


			//block
			for(var i = 0; i < block_arr.length; i++ ){

				var b = block_arr[i];

				if( factor ){
					b.position.x += back_speed;
				}else{
					b.position.y -= back_speed;
				}

				if(b.position.y + b.geometry.parameters.width/2 <= -50 || b.position.x + b.geometry.parameters.width/2 >= 80 ){

					b.life = false;

					block_arr.splice( i ,1 );

					i--;

					block_index--;

					this.plane.remove( b );

				}
			}

			if(back_i == 0){
				endFn && endFn();
			}

		},

		collision : function(s1,s2){  // 判断两个物体是否碰撞  man  block

			var dis1 = s1.target_s1 ;
			var dis2 = s1.target_s2 ;

			console.log( "dis1:" + dis1 , "dis2:" + dis2)

			if (dis1 < s2.position.y - s2.geometry.parameters.width/2 ) {
				return false;
			}
			if ( s2.position.y + s2.geometry.parameters.width/2 < dis1 ) {
				return false;
			}

			if (dis2 < s2.position.x - s2.geometry.parameters.width/2 ) {
				return false;
			}
			if ( s2.position.x + s2.geometry.parameters.width/2 < dis2 ) {
				return false;
			}

			return true;			
		},

		collision2 : function(s1,s2){  // 判断两个物体是否碰撞
			if( factor ){
				if (s1.position.x + 2.6 > s2.position.x - s2.geometry.parameters.width/2 && s1.position.x -2.6< s2.position.x + s2.geometry.parameters.width/2  && s1.position.z - 5 < s2.position.z + s2.geometry.parameters.depth/2 ) {

					if( s1.position.x < s2.position.x ){
						return "top";
					}else{
						return "bottom";
					}
				}
			}else{
				if (s1.position.y + 2.6 > s2.position.y - s2.geometry.parameters.width/2 && s1.position.y -2.6< s2.position.y + s2.geometry.parameters.width/2  && s1.position.z - 5 < s2.position.z + s2.geometry.parameters.depth/2 ) {

					if( s1.position.y < s2.position.y ){
						return "left";
					}else{
						return "right";
					}
				}
			}
			return false;

		},

		onDocumentTouchStart : function(){
			if( man.back_flag || man.ready_flag ) return;
			touch_flag = true;
		}, 

		onDocumentTouchMove : function(){

		},

		onDocumentTouchEnd : function(){
			if( !touch_flag ) return;
			touch_flag = false;
		}

	}

}

window.onload = function(){
	var game = Game();
	game.init();
	
}


