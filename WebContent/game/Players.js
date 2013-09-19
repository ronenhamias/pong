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
			upL	: keyboard.pressed('q')|| keyboard.pressed('e'),
			downL	: keyboard.pressed('w') || keyboard.pressed('a'),
		};
	
		if( controls.upR ){
			pos = -delta*speedY;
			players['right'].object3d.translateZ(pos);
			server.moveRacket("right",pos);
		}
		if( controls.downR ){
			pos = +delta*speedY;
			players['right'].object3d.translateZ(pos);
			server.moveRacket("right",pos);
		}
		
		if( controls.leftR ){	
			pos = +delta*speedY;
			players['right'].object3d.translateZ(pos);
			server.moveRacket("right",pos);
		};
		if( controls.rightR ){	
			pos = -delta*speedY;
			players['right'].object3d.translateZ(pos);
			server.moveRacket("right",pos);
		}
		
		if( controls.upL )	{
			pos = -delta*speedY;
			players['left'].object3d.translateZ(pos);
			server.moveRacket("left",pos);
		}
		if( controls.downL ){
			pos = +delta*speedY;
			players['left'] .object3d.translateZ(pos);
			server.moveRacket("left",pos);
		}
		// handle racket limit
		Object.keys(players).forEach(function(playerId){
			tMesh	= players[playerId].object3d.get(0);
			tMesh.position.z= Math.max(tMesh.position.z, -fieldD/2 + racketD/2);
			tMesh.position.z= Math.min(tMesh.position.z, +fieldD/2 - racketD/2);
			
			max = Math.min(tMesh.position.z, -fieldD/2 + racketD/2);
			min = Math.max(tMesh.position.z, -fieldD/2 + racketD/2);
			
			
		});
		
	});
	server.on("onOpponentRacketMove",function(playerId,pos){
		if(playerId=="left")
			players['left'] .object3d.translateZ(pos);
		if(playerId=="right"){
			players['right'] .object3d.translateZ(pos);
		}
	});
	return players;
}