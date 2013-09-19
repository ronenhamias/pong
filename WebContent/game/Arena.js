function Arena(world){
	// create the ground
	tQuery.createCube(1,0.2,1, 3,3,3).addTo(world)
		.receiveShadow(true)
		.geometry().smooth(2).back()
		.scale(3*1.5, 1, 1.8*1.5)
		.translateY(-0.2-0.1)
		.setLambertMaterial().map('images/ground.png').ambient(0x444444).back();

	// lights
	tQuery.createAmbientLight().addTo(world).color(0x444444);
	tQuery.createPointLight().addTo(world).intensity(1).distance(30);
	tQuery.createDirectionalLight().addTo(world)
		.position(2, 4, -1.5).color(0xffffff)
		.castShadow(true)
		.shadowCamera(2, -2, 2, -2, 0.01, 200)
		.shadowDarkness(0.7).shadowBias(.002);
		//.shadowCameraVisible(true);
};