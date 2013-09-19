
function Server(address){
 
   Server.prototype.gameSession;
   Server.prototype.playerId;
   
   actions	= { 
		        "startGame" : { callback : {} },
		        "onOpponentRacketMove" : { callback : {} },
		        "onOpponentBallMove" : { callback : {} }
              };	
   
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
	   console.log(data);
		json = JSON.parse(data);
		if(json.qualifier === "com.pt.openapi.pingpong.game/start"){
			Server.gameSession =json.data.gameSession;
			Server.playerId = json.data.playerId;
			actions["startGame"].callback(Server.gameSession,Server.playerId);
			msg = '{"qualifier":"pt.openapi.pubsub/subscribe","data":{"topic":"pingpong.game.'+Server.gameSession+'"}}';
			socket.send(msg);
		}else if(json.qualifier=="com.pt.pingpong.game/racket"){
			if(json.data.playerId!=Server.prototype.playerId)
			actions["onOpponentRacketMove"].callback(json.data.playerId,json.data.pos,json.data.index);
		}else if(json.qualifier=="com.pt.pingpong.game/ball"){
			actions["onOpponentBallMove"].callback(json.data.playerId,json.data.pos,json.data.index);
		}
	});

   this.connect = function (){
		
   };
   
	// Add a disconnect listener
   socket.on('disconnect', function() {});
 
   Server.prototype.moveRacket = function(Id,pos,i){
	   //if(Server.playerId== Id){
    	 var data= {playerId: Id ,pos:pos,index:i};
    	 msg = '{"qualifier":"pt.openapi.pubsub/publish/1.0","data":{"qualifier":"com.pt.pingpong.game/racket","topic":"pingpong.game.'+Server.gameSession+'","data":'+JSON.stringify( data)+'}}';
    	 socket.send(msg);
	   //}
   };
   
   Server.prototype.moveball = function(Id,pos,i){
	   //if(playerId!=Server.playerId){
    	 var data= {playerId: Id ,pos:pos, index : i};
    	 msg = '{"qualifier":"pt.openapi.pubsub/publish/1.0","data":{"qualifier":"com.pt.pingpong.game/ball","topic":"pingpong.game.'+Server.gameSession+'","data":'+JSON.stringify( data)+'}}';
    	 socket.send(msg);
	   //}
   };
   
   return this;
};