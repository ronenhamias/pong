function World(){
    //	create a tQuery.World
	this.world	= tQuery.createWorld().boilerplate().start();
    //	no camera controls is needed
	this.world.removeCameraControls();
	this.world.tCamera().position.y	= 5.5;
	this.world.tCamera().position.z	= 10.2;
	this.world.tCamera().position.normalize().setLength(3.5);
	this.world.tCamera().lookAt(this.world.tScene().position);
	
    //	add a blue sky
    //	world.tRenderer().setClearColorHex(1,1,1,1);
	this.world.tRenderer().setClearColorHex(0,0);
	tQuery.addBlueSkyBackground();

    //	enable shadow in the renderer
	this.world.tRenderer().shadowMapEnabled	= true;
	this.world.tRenderer().shadowMapSoft		= true;

    //	enable tween updater	
	this.world.enableTweenUpdater();
	
	
	this.world.loop().hook(function(delta, now){
		// get ball position
		var position	= ball3d.get(0).position;
		// update position
		position.x	+= ballVelX * (60 * delta);	
		position.z	+= ballVelZ * (60 * delta);
		// handle border contact
		if( position.z < -fieldD/2 + ballRadius/2)	this.wallOnContact('north');
		if( position.z > +fieldD/2 - ballRadius/2)	this.wallOnContact('south');
		// handle score
		if( position.x < -fieldW/2 + ballRadius/2)	addScore('right');
		if( position.x > +fieldW/2 - ballRadius/2)	addScore('left');

		// bounce the ball if it reach the border
		if( position.x < -fieldW/2 + ballRadius/2)	ballVelX	*= -1;
		if( position.x > +fieldW/2 - ballRadius/2)	ballVelX	*= -1;
		if( position.z < -fieldD/2 + ballRadius/2)	ballVelZ	*= -1;
		if( position.z > +fieldD/2 - ballRadius/2)	ballVelZ	*= -1;

		// set volume depending on ballSpeed
		var fxIntensity	= fxIntensityFromBallSpeed();
		webaudio	&& webaudio.volume(0.4+fxIntensity*0.4)

		// get the boundaries
		position.x	= Math.max(position.x, -fieldW/2+ballRadius/2);
		position.x	= Math.min(position.x, +fieldW/2-ballRadius/2);
		position.z	= Math.max(position.z, -fieldD/2+ballRadius/2);
		position.z	= Math.min(position.z, +fieldD/2-ballRadius/2);
		// check collision with each player racket
		["right", "left"].forEach(function(playerId){
			// get tQuery.Object3D for this player
			var player	= players[playerId];
			var object3d	= player.object3d;
			// get the position in X and Y
			var racketX	= object3d.get(0).position.x;
			var racketZ	= object3d.get(0).position.z;
			// test each ball boundary
			var mayHitLeft	= (position.x+ballRadius/2) >= (racketX-racketW/2);
			var mayHitRight	= (position.x-ballRadius/2) <= (racketX+racketW/2);
			var mayHitTop	= (position.z+ballRadius/2) >= (racketZ-racketD/2);
			var mayHitBottom= (position.z-ballRadius/2) <= (racketZ+racketD/2);
			// test if there is collision
			if( mayHitLeft && mayHitRight && mayHitTop && mayHitBottom ){
				// reaction of a collision
				ballVelX	*= -1;
				var deltaX	= racketW/2 + ballRadius/2;
				position.x	= racketX + (playerId === "right"? -deltaX : +deltaX);
				player.onContact && player.onContact(player, ball3d);
			}
		});
	});
	
	
	return this;
};