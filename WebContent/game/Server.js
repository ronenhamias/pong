
function Server(address){
	
	Server.prototype.gameSession;
	Server.prototype.playerId;
	Server.prototype.contextId;
	actions	= { 
			"startGame" : { callback : {} },
			"onOpponentRacketMove" : { callback : {} },
			"onOpponentBallMove" : { callback : {} },
			"onSetScore" : { callback : {} },
			"onLeftPostions" : { callback : {} },
			"status":  { callback : {} }
	};	

	Server.prototype.on = function (id,callback) {
		actions[id].callback = callback;
	};

	var joinRequest =  '{"qualifier":"com.pt.openapi.pingpong.game/start","contextId":"' +Server.contextId+ '"}';
	var createContexRequest =  '{"qualifier":"pt.openapi.context/createContextRequest","data":{"properties":null}}';

	var socket = io.connect('http://' + address, {
		'transports' : [ 'websocket', 'xhr-polling' ],
		'reconnection delay' : 2000,
		'force new connection' : true,
	});
	
	// Add connect listener
	socket.on('connect', function() {
		socket.send(createContexRequest);
		actions["status"].callback("Waiting for opponent to join a the table... ");
	});

	// Add a message listener
	socket.on('message', function(data) {
		console.log(data);
		json = JSON.parse(data);
		
		if(json.qualifier === "pt.openapi.context/createContextResponse"){
			actions["status"].callback("connected to server: " + address);
			Server.contextId = json.data.contextId;
			socket.send( '{"qualifier":"com.pt.openapi.pingpong.game/start","contextId":"' +Server.contextId+ '"}');
		}else if(json.qualifier === "com.pt.openapi.pingpong.game/start"){
			
			Server.gameSession =json.data.gameSession;
			Server.playerId = json.data.playerId;
			actions["startGame"].callback(Server.gameSession,Server.playerId);
			msg = '{"qualifier":"pt.openapi.pubsub/subscribe","contextId":"' +Server.contextId+ '","data":{"topic":"pingpong.game.'+Server.gameSession+'"}}';
			socket.send(msg);
			actions["status"].callback("player joined the game you are "+ Server.playerId + " player");
		}else if(json.qualifier=="com.pt.openapi.pingpong.game/racket"){
			actions["onOpponentRacketMove"].callback(json.data);
		}else if(json.qualifier=="com.pt.pingpong.game/ball"){
			actions["onOpponentBallMove"].callback(json.data.playerId,json.data.pos,json.data.index);
		}else if(json.qualifier=="com.pt.pingpong.game/score"){
			actions["onSetScore"].callback(json.data.playerId,json.data.left,json.data.right,json.data.index);
		}else if(json.qualifier=="com.pt.pingpong.game/positions"){
			actions["onLeftPostions"].callback(json.data.positions,json.data.index);
		}
	});

	this.connect = function (){

	};

	// Add a disconnect listener
	socket.on('disconnect', function() {});

	Server.prototype.sendPositions= function(positions,i){
		var data={positions:positions,index:i};
		msg = '{"qualifier":"pt.openapi.pubsub/publish/1.0","contextId":"' +Server.contextId+ '","data":{"qualifier":"com.pt.pingpong.game/positions","topic":"pingpong.game.'+Server.gameSession+'","data":'+JSON.stringify( data)+'}}';
		socket.send(msg);
	};
	Server.prototype.setScore = function(id,left,right,i){
		var data= {playerId: id,left: left ,right:right,index:i};
		msg = '{"qualifier":"pt.openapi.pubsub/publish/1.0","contextId":"' +Server.contextId+ '","data":{"qualifier":"com.pt.pingpong.game/score","topic":"pingpong.game.'+Server.gameSession+'","data":'+JSON.stringify( data)+'}}';
		socket.send(msg);
	};

	Server.prototype.moveRacket = function(id,racketId,pos){
		if(pos==0) return;
		
		var data= {gameSession:Server.gameSession, playerId: id ,racketId:racketId,pos:pos};
		msg = '{"qualifier":"com.pt.openapi.pingpong.game/racket","contextId":"' +Server.contextId+ '","data":'+JSON.stringify( data)+'}';
		socket.send(msg);
		//}
	};

	Server.prototype.moveball = function(Id,pos,i){		
		var data= {playerId: Id ,pos:pos, index : i};
		msg = '{"qualifier":"pt.openapi.pubsub/publish/1.0","contextId":"' +Server.contextId+ '","data":{"qualifier":"com.pt.pingpong.game/ball","topic":"pingpong.game.'+Server.gameSession+'","data":'+JSON.stringify( data)+'}}';
		socket.send(msg);
		//}
	};

	return this;
};