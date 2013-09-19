function Walls(world,sound,fieldW){
//////////////////////////////////////////////////////////////////////////
	//		Walls							//
	//////////////////////////////////////////////////////////////////////////
	walls	= {};
	url		= "images/hazard.jpg";
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
	};
}