function World(){
	// create a tQuery.World
	world	= tQuery.createWorld().boilerplate().start();
	// no camera controls is needed
	world.removeCameraControls();
	world.tCamera().position.y	= 40.5;
	world.tCamera().position.z	= 18.2;
	world.tCamera().position.x	= 125;
	world.tCamera().position.normalize().setLength(3);
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
	
	
	
	return world;
};