function Players(){

	// some constants for players
	this.players	= { "right" : { playerId : "right" }, "left": { playerId : "left" } };	
	racketW	= 0.1;
	racketD	= 0.5;
	racketRangeY= 2;
	// init each player
	Object.keys(players).forEach(function(playerId){
		player	= players[playerId];
		// create tQuery.Object3D for a racket
		playerColor	= playerId === 'right' ? 0xF04040 : 0x1c58e0;
		object3d	= tQuery.createCube(1,1,1,2,2,2).addTo(world)
				.geometry().scaleBy(racketW, 0.2, racketD).back()
				.setLambertMaterial().color(playerColor).ambient(0xaaaaaa).map("images/plywood.jpg").back()
				.id(playerId)
				.castShadow(true)
				.geometry().computeAll().smooth(2).back();

		object3d.translateX(1.3 * (playerId === "right" ? +1 : -1));
		player.object3d	= object3d;
	});
}


function Ball(){
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
	
	this.position = function(){
		return this.ball3d.get(0).position;
	};
}

function Game(){
    sound = new Sound();
    
	// create a tQuery.World
	world	= tQuery.createWorld().boilerplate().start();
	// no camera controls is needed
	world.removeCameraControls();
	world.tCamera().position.y	= 1161.5;
	world.tCamera().position.z	= 1151.2;
	world.tCamera().position.normalize().setLength(13.5);
	world.tCamera().lookAt(world.tScene().position);
	
	// add a blue sky
//	world.tRenderer().setClearColorHex(1,1,1,1);
	world.tRenderer().setClearColorHex(0,0);
	tQuery.addBlueSkyBackground();
	
	// enable shadow in the renderer
	world.tRenderer().shadowMapEnabled	= true;
	world.tRenderer().shadowMapSoft		= true;

	// enable tween updater	
	world.enableTweenUpdater();

	/////////////////////////////////////////////////////////////////////////
	// init fireworks.js particles
	smokepuff	= new Fireworks.ComboEmitter.Smokepuff();
	tQuery(smokepuff.object3D()).addTo(world).scale(1/10);
	smokepuff.sound().volume(0.3);


	ball = new Ball();
	
	/////////////////////////////////////////////////////////////////////////
	// add the referee
	character	= new tQuery.MinecraftChar({
		skinUrl	: "images/agentsmith.png"
	});
	character.model.scaleBy(2.5/4).translateY(+0.1).translateZ(-1).addTo(world);
	// setup the limbs positions
	character.parts.legL.rotation.z = +Math.PI/16;
	character.parts.legR.rotation.z = -Math.PI/16;
	character.parts.armL.rotation.x = -Math.PI/8;
	character.parts.armR.rotation.x = -Math.PI/8;
	// make the head follow the ball
	character.parts.headGroup.matrixAutoUpdate = false;
	character.parts.headGroup.updateMatrix();
	world.loop().hook(function(delta, now){
		charPosition= character.model.get(0).position;
		target	= ball.position().clone().subSelf(charPosition);
		character.parts.headGroup.lookAt(target);
	}); 
    

	// create the ground
	tQuery.createCube(1,0.2,1, 3,3,3).addTo(world)
		.receiveShadow(true)
		.geometry().smooth(2).back()
		.scale(3*1.5, 1, 1.8*1.5)
		.translateY(-0.2-0.1)
		.setLambertMaterial().map('images/13663tennis_court_grass.jpg').ambient(0x444444).back();

	// lights
	tQuery.createAmbientLight().addTo(world).color(0x444444);
	tQuery.createPointLight().addTo(world).intensity(1).distance(30);
	tQuery.createDirectionalLight().addTo(world)
		.position(2, 4, -1.5).color(0xffffff)
		.castShadow(true)
		.shadowCamera(2, -2, 2, -2, 0.01, 200)
		.shadowDarkness(0.7).shadowBias(.002);
		//.shadowCameraVisible(true);

	players = new Players();
	players.init();
	
	/**
	 * Function called when playerId scored a point
	*/
	addScore = function (playerId){
		selector	= {
			right	: '#scoreRight',
			left	: '#scoreLeft'
		}[playerId];
		element	= document.querySelectorAll(selector)[0];
		score	= parseInt(element.innerHTML);
		score++;
		element.innerHTML= score;

		sound.playLoseSound();

		// reset ball velocity
		ballAngle	= 0.1 * (Math.random()*2-1)*Math.PI*2;
		ballAngle	+= playerId === 'right' ? 0 : Math.PI;
		ballVelX	= Math.cos(ballAngle)*0.03;
		ballVelZ	= Math.sin(ballAngle)*0.03;
		// put it back in the center
		ball3d.position(0,0,0);
	};
	fxIntensityFromBallSpeed =function (){
		ballSpeed	= Math.sqrt(ballVelX*ballVelX + ballVelZ*ballVelZ);
		// slow: 0.33 fast: 0.1
		loSpeed	= 0.033;
		hiSpeed	= 0.1;
		fxIntensity	= (ballSpeed-loSpeed) / (hiSpeed-loSpeed);
		fxIntensity	= Math.min(fxIntensity, 1);
		fxIntensity	= Math.max(fxIntensity, 0);
		return fxIntensity;
	};
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
	this.players['right'].onContact = this.players['left'].onContact = function(player, ball3d){
		// increase velocity by 5% everytime you connect
		ballVelX 	*= 1.05;
		ballVelZ	*= 1.05;


		fxIntensity	= fxIntensityFromBallSpeed();

		// update emitter's position just before the shoot then shoot
		playerPos	= player.object3d.get(0).position.clone();
		playerPos.multiplyScalar(1/smokepuff.object3D().scale.x);
		smokepuff.emitter().effect('position').opts.shape.position.copy(playerPos);
		smokepuff.emitter().intensity(fxIntensity);
		smokepuff.shoot();

		// tween the scale
		delayFwd	= 150+50*fxIntensity;
		delayBack	= 175+75*fxIntensity;
		tQuery.createTween({
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
		
		//////////////////////////////////////////////////////////////////
		// compute rebound angle with racket
		//////////////////////////////////////////////////////////////////
		// compute ball speed + angle
		ballSpeed	= Math.sqrt(ballVelX*ballVelX+ballVelZ*ballVelZ);
		ballAngle	= Math.atan2(ballVelZ,ballVelX);
		// compute where in the racket the ball is contacting
		playerPos	= player.object3d.get(0).position;
		delta	= (playerPos.z - ball.position().z) / (racketD+ball.ballRadius*2) * 2;
		// compute the angle delta based on contact position on racket
		maxDeltaAng	= 30 * Math.PI/180;
		deltaAngle	= delta * maxDeltaAng;
		ballAngle	+= deltaAngle * (player.object3d.id() === "right" ? +1 : -1);
		// reinit ball velocity
		ballVelX	= Math.cos(ballAngle)*ballSpeed;
		ballVelZ	= Math.sin(ballAngle)*ballSpeed;			
	};

	// constant for the field
	fieldW	= 4;
	fieldD	= 1.8;
	
	
	world.loop().hook(function(delta, now){
		// get ball position
		position	= ball3d.get(0).position;
		// update position
		position.x	+= ballVelX * (60 * delta);	
		position.z	+= ballVelZ * (60 * delta);
		// handle border contact
		if( position.z < -fieldD/2 + ballRadius/2)	wallOnContact(walls['north']);
		if( position.z > +fieldD/2 - ballRadius/2)	wallOnContact(walls['south']);
		// handle score
		if( position.x < -fieldW/2 + ballRadius/2)	addScore('right');
		if( position.x > +fieldW/2 - ballRadius/2)	addScore('left');
		
		// bounce the ball if it reach the border
		if( position.x < -fieldW/2 + ballRadius/2)	ballVelX	*= -1;
		if( position.x > +fieldW/2 - ballRadius/2)	ballVelX	*= -1;
		if( position.z < -fieldD/2 + ballRadius/2)	ballVelZ	*= -1;
		if( position.z > +fieldD/2 - ballRadius/2)	ballVelZ	*= -1;

		// set volume depending on ballSpeed
		fxIntensity	= fxIntensityFromBallSpeed();
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
				ballVelX	*= -1;
				deltaX	= racketW/2 + ballRadius/2;
				position.x	= racketX + (playerId === "right"? -deltaX : +deltaX);
				player.onContact && player.onContact(player, ball3d);
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

		// tween the scale
		tQuery.createTween({
			scale	: 1
		}).easing(TWEEN.Easing.Elastic.Out).to({
			scale	: 2
		}, 300).onUpdate(function(){
			object.scale(1, scale, scale);
		}).start().thenBounce(200).easing(TWEEN.Easing.Linear.None).back();
	};
};