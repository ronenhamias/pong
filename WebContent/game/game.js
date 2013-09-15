/**
	 * Function called when playerId scored a point
	 */
	function addScore(playerId){
		var selector	= {
				right	: '#scoreRight',
				left	: '#scoreLeft'
		}[playerId];
		var element	= document.querySelectorAll(selector)[0];
		var score	= parseInt(element.innerHTML);
		score++;
		element.innerHTML= score;

		soundLose && soundLose.play();

		// reset ball velocity
		ballAngle	= 0.1 * (Math.random()*2-1)*Math.PI*2;
		ballAngle	+= playerId === 'right' ? 0 : Math.PI;
		ballVelX	= Math.cos(ballAngle)*0.03;
		ballVelZ	= Math.sin(ballAngle)*0.03;
		// put it back in the center
		ball3d.position(0,0,0);
	};
	function fxIntensityFromBallSpeed(){
		var ballSpeed	= Math.sqrt(ballVelX*ballVelX + ballVelZ*ballVelZ);
		// slow: 0.33 fast: 0.1
		var loSpeed	= 0.033;
		var hiSpeed	= 0.1;
		var fxIntensity	= (ballSpeed-loSpeed) / (hiSpeed-loSpeed);
		fxIntensity	= Math.min(fxIntensity, 1);
		fxIntensity	= Math.max(fxIntensity, 0);
		return fxIntensity;
	};