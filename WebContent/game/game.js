
function Game(server,gameSession,currentPlayerId){

	// constant for the field
	fieldW	= 4;
	fieldD	= 1.8;

	sound = new Sound();
	world = new World();
	ball = new Ball(server,world);
	referee = new Referee(world,ball);
	walls = new Walls(world,sound,fieldW);
	arena = new Arena(world);
	players = new Players(server,world);

	/////////////////////////////////////////////////////////////////////////
	// init fireworks.js particles
	smokepuff	= new Fireworks.ComboEmitter.Smokepuff();
	tQuery(smokepuff.object3D()).addTo(world).scale(1/10);
	smokepuff.sound().volume(0.3);

	/**
	 * Function called when the ball touch the racket
	 */
	players['right'].onContact = players['left'].onContact = function(player, ball3d){
		fxIntensity	= ball.fxIntensityFromBallSpeed();

		// update emitter's position just before the shoot then shoot
		playerPos	= player.object3d.get(0).position.clone();
		playerPos.multiplyScalar(1/smokepuff.object3D().scale.x);
		smokepuff.emitter().effect('position').opts.shape.position.copy(playerPos);
		smokepuff.emitter().intensity(fxIntensity);
		smokepuff.shoot();

		ball.computeBall();
		// compute where in the racket the ball is contacting
		playerPos	= player.object3d.get(0).position;
		delta	= (playerPos.z - ball.ball3d.get(0).position.z) / (racketD+ball.ballRadius*2) * 2;
		// compute the angle delta based on contact position on racket
		maxDeltaAng	= 30 * Math.PI/180;
		deltaAngle	= delta * maxDeltaAng;
		ball.ballAngle	+= deltaAngle * (player.object3d.id() === "right" ? +1 : -1);
		// reinit ball velocity
		ball.ballVelX	= Math.cos(ball.ballAngle)*ball.ballSpeed;
		ball.ballVelZ	= Math.sin(ball.ballAngle)*ball.ballSpeed;			
	};


	var i = 0;
	world.loop().hook(function(delta, now){
		// get ball position
		position	= ball.ball3d.get(0).position;
		ball.updatePosition(delta);
		ballRadius=ball.ballRadius;
		// handle border contact
		if( position.z < -fieldD/2 + ballRadius/2)	wallOnContact(walls['north']);
		if( position.z > +fieldD/2 - ballRadius/2)	wallOnContact(walls['south']);
		// handle score
		if( position.x < -fieldW/2 + ballRadius/2)	{
			addScore('right');
			ball.reset('right');
		};
		if( position.x > +fieldW/2 - ballRadius/2)	{
			addScore('left');
			ball.reset('left');
		};

		// bounce the ball if it reach the border
		if( position.x < -fieldW/2 + ballRadius/2)	ball.ballVelX	*= -1;
		if( position.x > +fieldW/2 - ballRadius/2)	ball.ballVelX	*= -1;
		if( position.z < -fieldD/2 + ballRadius/2)	ball.ballVelZ	*= -1;
		if( position.z > +fieldD/2 - ballRadius/2)	ball.ballVelZ	*= -1;

		// set volume depending on ballSpeed
		fxIntensity	= ball.fxIntensityFromBallSpeed();
		webaudio	&& webaudio.volume(0.4+fxIntensity*0.4);

		// get the boundaries
		position.x	= Math.max(position.x, -fieldW/2+ballRadius/2);
		position.x	= Math.min(position.x, +fieldW/2-ballRadius/2);
		position.z	= Math.max(position.z, -fieldD/2+ballRadius/2);
		position.z	= Math.min(position.z, +fieldD/2-ballRadius/2);
		// check collision with each player racket
		["right", "left"].forEach(function(playerId){
			// get tQuery.Object3D for this player
			player	= players[playerId];
			object3d	= player.object3d;
			// get the position in X and Y
			racketX	= object3d.get(0).position.x;
			racketZ	= object3d.get(0).position.z;
			// test each ball boundary
			mayHitLeft	= (position.x+ballRadius/2) >= (racketX-racketW/2);
			mayHitRight	= (position.x-ballRadius/2) <= (racketX+racketW/2);
			mayHitTop	= (position.z+ballRadius/2) >= (racketZ-racketD/2);
			mayHitBottom= (position.z-ballRadius/2) <= (racketZ+racketD/2);
			// test if there is collision
			if( mayHitLeft && mayHitRight && mayHitTop && mayHitBottom ){
				// reaction of a collision
				ball.ballVelX	*= -1;
				deltaX	= racketW/2 + ballRadius/2;
				position.x	= racketX + (playerId === "right"? -deltaX : +deltaX);
				player.onContact && player.onContact(player, ball.ball3d);
				ball.speedIncrease();
			}
		});

	});
};