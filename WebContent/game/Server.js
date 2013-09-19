
function Server(address){
 
   var gameSession;
   var playerId;
   
   actions	= { "startGame" : { callback : {} } };	
   
   Server.prototype.on = function (id,callback) {
	   actions[id].callback = callback;
   };
   
   var joinRequest =  '{"qualifier":"com.pt.openapi.pingpong.game/start"}';
   
   var socket = io.connect('http://' + address, {
   	'transports' : [ 'websocket', 'xhr-polling' ],
       'reconnection delay' : 2000,
       'force new connection' : true,
  	});
   
    // Add connect listener
   socket.on('connect', function() {
		 socket.send( joinRequest);
	});

	// Add a message listener
   socket.on('message', function(data) {
		json = JSON.parse(data);
		if(json.qualifier === "com.pt.openapi.pingpong.game/start"){
			this.gameSession =json.data.gameSession;
			this.playerId = json.data.playerId;
			actions["startGame"].callback(this.gameSession,this.playerId);
		}
	});

   this.connect = function (){
		
   };
   
	// Add a disconnect listener
   socket.on('disconnect', function() {});
 
   this.moveRacket = function(playerId,max,min){
    	var data= {playerId: playerId ,max:max  ,min:min};
    	this.socket.send('{"qualifier":"pt.openapi.pubsub/publish/1.0","topic":"pingpong.raket.'+this.gameSession+'.'+data.playerId+'","data":'+JSON.stringify( data)+'}');
   };
   
   
   return this;
};