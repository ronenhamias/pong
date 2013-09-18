
function Game(){
    sound = new Sound();
    world = new World();
	ball = new Ball(world);
	referee = new Referee(world,ball);
	
	/////////////////////////////////////////////////////////////////////////
	// init fireworks.js particles
	smokepuff	= new Fireworks.ComboEmitter.Smokepuff();
	tQuery(smokepuff.object3D()).addTo(world).scale(1/10);
	smokepuff.sound().volume(0.3);
	arena = new Arena(world);
	players = new Players(world);
	
	
	
	// handle player keyboard
	world.loop().hook(function(delta){
		keyboard	= tQuery.keyboard();
		speedY	= 2 * (60*delta);
		controls	= {
			upR	: keyboard.pressed('up'),
			downR	: keyboard.pressed('down'),
			upL	: keyboard.pressed('q'),
			downL	: keyboard.pressed('w') || keyboard.pressed('a'),
		};
	
		if( controls.upR )	players['right'].object3d.translateZ(-delta*speedY);
		if( controls.downR )	players['right'].object3d.translateZ(+delta*speedY);
		if( controls.upL )	players['left'].object3d.translateZ(-delta*speedY);
		if( controls.downL )	players['left'] .object3d.translateZ(+delta*speedY);
		// handle racket limit
		Object.keys(players).forEach(function(playerId){
			
			tMesh	= players[playerId].object3d.get(0);
			tMesh.position.z= Math.max(tMesh.position.z, -fieldD/2 + racketD/2);
			tMesh.position.z= Math.min(tMesh.position.z, +fieldD/2 - racketD/2);
			
			max = Math.min(tMesh.position.z, -fieldD/2 + racketD/2);
			min = Math.max(tMesh.position.z, -fieldD/2 + racketD/2);
			
			server.moveRacket(playerId ,max  ,min );
		});
		
	});

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

		// tween the scale
		delayFwd	= 150+50*fxIntensity;
		delayBack	= 175+75*fxIntensity;
		/*tQuery.createTween({
			scale	: 1
		}).easing(TWEEN.Easing.Bounce.Out).to({
			scale	: 1+fxIntensity*1
		}, delayFwd).onUpdate(function(){
			player.object3d.scale(scale, scale, scale);
		}).start().thenBounce(delayBack).easing(TWEEN.Easing.Elastic.In).back();
       
		// tween the positionZ/rotationZ
		tQuery.createTween({ 
			positionZ	: 0,
			rotationZ	: 0
		}).easing(TWEEN.Easing.Quintic.Out).to({
			positionZ	: 0.05 + fxIntensity*0.15,
			rotationZ	: Math.PI/(8-5*fxIntensity)
		}, delayFwd).onUpdate(function(){
			playerId	= player.playerId;
			tObject3d	= player.object3d.get(0);
			positionZ	= playerId === 'right' ? +positionZ : -positionZ;
			tObject3d.position.x	= positionZ + (1.3 * (playerId === "right" ? +1 : -1));
			rotationZ	= playerId === 'right' ? -rotationZ : +rotationZ;
			tObject3d.rotation.z	= rotationZ;
		}).start().thenBounce(delayBack).easing(TWEEN.Easing.Sinusoidal.InOut).back();
		 */
		
		ball.computeBall();
		
		// compute where in the racket the ball is contacting
		playerPos	= player.object3d.get(0).position;
		delta	= (playerPos.z - ball.position.z) / (racketD+ball.ballRadius*2) * 2;
		// compute the angle delta based on contact position on racket
		maxDeltaAng	= 30 * Math.PI/180;
		deltaAngle	= delta * maxDeltaAng;
		ball.ballAngle	+= deltaAngle * (player.object3d.id() === "right" ? +1 : -1);
		// reinit ball velocity
		ball.ballVelX	= Math.cos(ball.ballAngle)*ball.ballSpeed;
		ball.ballVelZ	= Math.sin(ball.ballAngle)*ball.ballSpeed;			
	};

	// constant for the field
	fieldW	= 4;
	fieldD	= 1.8;
	
	
	world.loop().hook(function(delta, now){
		// get ball position
		position	= ball.position;
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

	//////////////////////////////////////////////////////////////////////////
	//		Walls							//
	//////////////////////////////////////////////////////////////////////////
	walls	= {};
	url		= "images/plywood.jpg";
	walls['north']	= tQuery.createCylinder(0.05, 0.05, fieldW, 16, 4).addTo(world)
		.setLambertMaterial().color(0xFFFFFF).ambient(0xFFFFFF).map(url).back()
		.geometry().rotateZ(Math.PI/2).back()
		.translateY(-0.1)
		.translateZ(-1.8/2 - 0.05/2)
		.castShadow(true);
	walls['south']	= tQuery.createCylinder(0.05, 0.05, fieldW, 16, 4).addTo(world)
		.setLambertMaterial().color(0xFFFFFF).ambient(0xFFFFFF).map(url).back()
		.geometry().rotateZ(Math.PI/2).back()
		.translateY(-0.1)
		.translateZ(+1.8/2 + 0.05/2)
		.castShadow(true);
		
	wallOnContact = function (object){
		sound.playWallSound();

		/* tween the scale
		tQuery.createTween({
			scale	: 1
		}).easing(TWEEN.Easing.Elastic.Out).to({
			scale	: 2
		}, 300).onUpdate(function(){
			object.scale(1, scale, scale);
		}).start().thenBounce(200).easing(TWEEN.Easing.Linear.None).back();
		*/
	};
};