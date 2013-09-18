function Referee(world,ball){
	
	
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
		target	= ball.position.clone().subSelf(charPosition);
		character.parts.headGroup.lookAt(target);
	}); 
    
	
}