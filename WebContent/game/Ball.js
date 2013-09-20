function Ball(server,world){
	// constant for the ball
	this.ballRadius	= 1/8;
	this.ballAngle	= Math.random()*Math.PI*2;
	this.ballAngle	= 0.1 * (Math.random()*2-1)*Math.PI*2;
	this.ballVelX	= Math.cos(this.ballAngle)*0.03;
	this.ballVelZ	= Math.sin(this.ballAngle)*0.03;


	// create a tQuery.Object3d for the ball
	this.ball3d	= tQuery.createSphere().addTo(world).scaleBy(this.ballRadius) 
	.setLambertMaterial()
	.color(0xFFFF00)
	.ambient(0xFFFFFF)
	.map("images/plywood.jpg")
	.back()
	.castShadow(true);

	Ball.ball3d = this.ball3d;

	Ball.prototype.setPosition = function(pos){
		if(Server.playerId!="left") return;
		this.ball3d.get(0).position.x = pos.x;
		this.ball3d.get(0).position.y = pos.y;
		this.ball3d.get(0).position.z = pos.z;
	};

	this.reset = function(playerId){
		if(Server.playerId!="left") return;
		// reset ball velocity
		this.ballAngle	= 0.1 * (Math.random()*2-1)*Math.PI*2;
		this.ballAngle	+= playerId === 'right' ? 0 : Math.PI;
		this.ballVelX	= Math.cos(this.ballAngle)*0.03;
		this.ballVelZ	= Math.sin(this.ballAngle)*0.03;
		// put it back in the center
		this.setPosition({"x":0,"y":0,"z":0});
	};

	this.speedIncrease = function(){
		if(Server.playerId!="left") return;
		// increase velocity by 5% everytime you connect
		this.ballVelX 	*= 1.05;
		this.ballVelZ	*= 1.05;
	};
	var i = 0;
	this.updatePosition=function(delta){

		if(Server.playerId=="left"){
			// update position 
			this.ball3d.get(0).position.x	+= this.ballVelX * (60 * delta);	
			this.ball3d.get(0).position.z	+= this.ballVelZ * (60 * delta);
			server.moveball(Server.playerId,this.ball3d.get(0).position,++i);
		}
	};
	var ballIndex = 0;
	server.on("onOpponentBallMove",function(playerId,pos,index){
		if(Server.playerId=="right"){
			if(ballIndex<index){
				ballIndex =index;
			}else{
				return;
			}
			Ball.ball3d.get(0).position.x =	pos.x;	
			Ball.ball3d.get(0).position.z =	pos.z;
			Ball.ball3d.get(0).position.y =	pos.y;
		}
	});

	this.fxIntensityFromBallSpeed =function (){
		if(Server.playerId!="left") return;
		this.ballSpeed	= Math.sqrt(this.ballVelX*this.ballVelX + this.ballVelZ*this.ballVelZ);
		// slow: 0.33 fast: 0.1
		this.loSpeed	= 0.033;
		this.hiSpeed	= 0.1;
		this.fxIntensity	= (this.ballSpeed-this.loSpeed) / (this.hiSpeed-this.loSpeed);
		this.fxIntensity	= Math.min(this.fxIntensity, 1);
		this.fxIntensity	= Math.max(this.fxIntensity, 0);
		return this.fxIntensity;
	};

	this.computeBall=function (){
		if(Server.playerId!="left") return;
		//////////////////////////////////////////////////////////////////
		// compute rebound angle with racket
		//////////////////////////////////////////////////////////////////
		// compute ball speed + angle
		this.ballSpeed	= Math.sqrt(this.ballVelX*this.ballVelX+this.ballVelZ*this.ballVelZ);
		this.ballAngle	= Math.atan2(this.ballVelZ,this.ballVelX);
	};
	return this;
};