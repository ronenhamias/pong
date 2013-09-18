function Players(world){

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
	
	return players;
}