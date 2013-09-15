function Walls(soundWall){
//////////////////////////////////////////////////////////////////////////
	//		Walls							//
	//////////////////////////////////////////////////////////////////////////
	this.walls	= {};
	this url		= "images/plywood.jpg";
	this.walls['north']	= tQuery.createCylinder(0.05, 0.05, fieldW, 16, 4).addTo(world)
	.setLambertMaterial().color(0xFFFFFF).ambient(0xFFFFFF).map(url).back()
	.geometry().rotateZ(Math.PI/2).back()
	.translateY(-0.1)
	.translateZ(-1.8/2 - 0.05/2)
	.castShadow(true);
	
	this.walls['south']	= tQuery.createCylinder(0.05, 0.05, fieldW, 16, 4).addTo(world)
	.setLambertMaterial().color(0xFFFFFF).ambient(0xFFFFFF).map(url).back()
	.geometry().rotateZ(Math.PI/2).back()
	.translateY(-0.1)
	.translateZ(+1.8/2 + 0.05/2)
	.castShadow(true);
	
	this.wallOnContact = function (value){
		this.object;
		
		if(value =='north'){
			object = this.walls['north'];
		}else (value =='south'){
			object = this.walls['south'];
		}
		
		soundWall && soundWall.play();
		// tween the scale
		tQuery.createTween({
			scale	: 1
		}).easing(TWEEN.Easing.Elastic.Out).to({
			scale	: 2
		}, 300).onUpdate(function(){
			this.object.scale(1, this.scale, this.scale);
		}).start().thenBounce(200).easing(TWEEN.Easing.Linear.None).back();
	};
	
	return this.walls;
};