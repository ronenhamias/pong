function Sound(){
	if( WebAudio.isAvailable ){
		// init audio layer
		webaudio	= new WebAudio();
		// init each sound
		jsfxParam	= ["sine",5.0000,0.3220,0.0000,0.0040,0.3210,0.3060,20.0000,347.0000,2400.0000,0.0000,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
	    soundWall	= webaudio.createSound().generateWithJsfx(jsfxParam);
		
		soundWall.volume(0.2);
		
		jsfxParam	= ["saw",0.0000,0.4000,0.0000,0.2800,0.0000,0.2380,20.0000,837.0000,2400.0000,-0.7300,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.3235,0.0100,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
		soundLose	= webaudio.createSound().generateWithJsfx(jsfxParam);		
		soundLose.volume(0.3);
		
	}
	
	this.playWallSound = function(){
		soundWall && soundWall.play();
	};
	
	this.playLoseSound=function(){
		soundLose && soundLose.play();
	};
};