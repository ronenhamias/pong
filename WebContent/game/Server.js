
function Server(address){
   this.socket; 
   
   this.gameSession;
   
   this.connect = function (){
		this.socket = io.connect('http://' + address, {
       	'transports' : [ 'websocket', 'xhr-polling' ],
           'reconnection delay' : 2000,
           'force new connection' : true,
      	});
		
		// Add connect listener
		this.socket.on('connect', function() {
		});

		// Add a message listener
		this.socket.on('message', function(data) {
		});

		// Add a disconnect listener
		this.socket.on('disconnect', function() {
		});
   };
   
   this.startGame = function(playerId){
	   
   };
   
   this.moveRacket = function(playerId,max,min){
    	var data= {playerId: playerId ,max:max  ,min:min};
    	this.socket.send('{"qualifier":"pt.openapi.pubsub/publish/1.0","topic":"pingpong.raket.'+this.gameSession+'.'+data.playerId+'","data":'+JSON.stringify( data)+'}');
   };
   return this;
};