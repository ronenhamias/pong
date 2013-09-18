function Ball(world){
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
	
	this.position = this.ball3d.get(0).position;

    this.reset = function(playerId){
    	// reset ball velocity
    	this.ballAngle	= 0.1 * (Math.random()*2-1)*Math.PI*2;
    	this.ballAngle	+= playerId === 'right' ? 0 : Math.PI;
    	this.ballVelX	= Math.cos(this.ballAngle)*0.03;
    	this.ballVelZ	= Math.sin(this.ballAngle)*0.03;
		// put it back in the center
    	this.ball3d.position(0,0,0);
    };
    
    this.speedIncrease = function(){
    	// increase velocity by 5% everytime you connect
    	this.ballVelX 	*= 1.05;
		this.ballVelZ	*= 1.05;
    };
    this.updatePosition=function(delta){
    	// update position 
    	this.position.x	+= this.ballVelX * (60 * delta);	
    	this.position.z	+= this.ballVelZ * (60 * delta);
    };
    
    this.fxIntensityFromBallSpeed =function (){
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
        //////////////////////////////////////////////////////////////////
		// compute rebound angle with racket
		//////////////////////////////////////////////////////////////////
		// compute ball speed + angle
		this.ballSpeed	= Math.sqrt(this.ballVelX*this.ballVelX+this.ballVelZ*this.ballVelZ);
		this.ballAngle	= Math.atan2(this.ballVelZ,this.ballVelX);
	};
    return this;
};