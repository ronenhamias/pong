function Players(server,world){

	// some constants for players
	players	= { "right" : { playerId : "right" }, "left": { playerId : "left" } };	
	racketW	= 0.1;
	racketD	= 0.5;
	racketRangeY= 2;
 


	initPlayer = function(playerId){
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
	};
	var index = 0;

	/**
	 * Function called when playerId scored a point
	 */
	addScore = function (playerId){
		var leftScore;
		var rightScore;

		if(playerId == "left" && Server.playerId=="left"){
			leftElement = getPlayerScore('left');
			leftScore	= parseInt(leftElement.innerHTML);
			leftScore=leftScore+1;
			leftElement.innerHTML= leftScore;

			rightElement = getPlayerScore('right');
			rightScore	= parseInt(rightElement.innerHTML);

		}else if(playerId == "right" && Server.playerId=="left"){
			rightElement = getPlayerScore('right');
			rightScore	= parseInt(rightElement.innerHTML);
			rightScore=rightScore+1;
			rightElement.innerHTML= rightScore;

			leftElement = getPlayerScore('left');
			leftScore	= parseInt(leftElement.innerHTML);

		}
		if (Server.playerId =="left"){
			server.setScore(Server.playerId,leftScore,rightScore, index);
		}
		sound.playLoseSound();

	};
	
	server.on("onSetScore",function(playerId,leftScore,rightScore,i ) {
		if (Server.playerId =="left")
			return;
		
		leftElement = getPlayerScore('left');
		leftElement.innerHTML= leftScore;

		rightElement = getPlayerScore('right');
		rightElement.innerHTML= rightScore;
	});

	getPlayerScore= function(playerId){
		selector	= {
				right	: '#scoreRight',
				left	: '#scoreLeft'
		}[playerId];
		element	= document.querySelectorAll(selector)[0];

		return element;
	};

	// init each player
	initPlayer('right');
	initPlayer('left');

	// handle player keyboard
	world.loop().hook(function(delta){
		keyboard	= tQuery.keyboard();
		speedY	= 2 * (60*delta);
		controls	= {
				upR	: keyboard.pressed('up'),
				downR	: keyboard.pressed('down'),
				leftR   : keyboard.pressed('left'),
				rightR   : keyboard.pressed('right'),
				upL	: keyboard.pressed('q'),
				downL	: keyboard.pressed('w')
		};
		var i = index++;

		var isLeft=false;
		var isRight=false;
		var posR=0;
		var posL=0;
		
		if( controls.upR ){
			posR = -delta*speedY;
			players['right'].object3d.translateZ(-delta*speedY);
			isRight =true;
		};
		if( controls.downR ){
			posR = +delta*speedY;
			players['right'].object3d.translateZ(+delta*speedY);
			isRight =true;
		};

		if( controls.leftR ){
			posR = +delta*speedY;
			players['right'].object3d.translateZ(+delta*speedY);
			isRight =true;
		};
		if( controls.rightR ){	
			posR = -delta*speedY;
			players['right'].object3d.translateZ(-delta*speedY);	
			isRight =true;
		};

		if( controls.upL )	{
			posL = -delta*speedY;
			players['left'].object3d.translateZ(-delta*speedY);
			isLeft =true;
		};
		if( controls.downL ){
			posL = +delta*speedY;
			players['left'] .object3d.translateZ(+delta*speedY);
			isLeft =true;
		};
		// handle racket limit
		Object.keys(players).forEach(function(playerId){
			tMesh	= players[playerId].object3d.get(0);
			tMesh.position.z= Math.max(tMesh.position.z, -fieldD/2 + racketD/2);
			tMesh.position.z= Math.min(tMesh.position.z, +fieldD/2 - racketD/2);

			max = Math.min(tMesh.position.z, -fieldD/2 + racketD/2);
			min = Math.max(tMesh.position.z, -fieldD/2 + racketD/2);
		});
		if(isRight && (posR>-1 && 1 >= posR))	server.moveRacket(Server.playerId,"right",posR);
		if(isLeft && (posL>-1 && 1 >= posL))	server.moveRacket(Server.playerId,"left",posL);
	});
	var playerIndex = 0;
	server.on("onOpponentRacketMove",function(data){
//		if(playerIndex<i){
//			playerIndex=i;
//		}else return;
		players[data.racketId].object3d.translateZ(data.pos);
		
	});
	return players;
}