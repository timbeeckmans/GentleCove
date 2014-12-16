//installingen
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require("underscore");

var clients = [];
var newclientid = 0;

/** CONFIG **/
require("./config/middleware.js")(app, express);
require("./config/handlebars.js")(app);

/** ROUTES **/
require("./controllers/pages.js")(app);

/** SOCKET **/
//default connect
io.on('connection', function(socket) {
	console.log("connect:", socket.id);
	var client = {
		id: newclientid,
		device: "desktop",
		socket_id: socket.id
	};

	newclientid++;
  clients.push(client);
	socket.emit("socket_id",client.id);

	//identify as mobile
	socket.on("mobileConnection", function(data) {
		//get mobile
		var client = _.filter(clients, function(client){
			return client.id == data.id;
		});
		if(client.length > 0){
			client[0].device = "mobile";
		}

		//get desktop
		var peer = _.filter(clients, function(peer){
			if(peer.id == data.peer_id){
				return peer;
			}
		});
		//check of de desktop client bestaat
		if(peer.length > 0){
			//laat zowel de desktop als mobile weten dat ze verbonden zijn
			io.to(peer[0].socket_id).emit("foundMobileDevice", data.id);
			socket.emit("validate", peer[0].socket_id);
		}else{
			//desktop bestaat niet
			socket.emit("wrongId");
		}
  });

	//reset camera position
	socket.on('resetPosition', function(data) {
		io.to(data).emit("resetPosition");
  });

	//start visuals op desktop vanaf mobile
  socket.on('mobileAccept', function(data) {
  	io.to(data).emit("mobileDeviceAccept");
  });

  //rotatie data
  socket.on('update', function(data) {
  	io.to(data.ontvanger).emit("update", data.rotatie);
  });

  //kleur data
  socket.on('color_change', function(data) {
  	io.to(data.ontvanger).emit("color_change", data.change);
  });

	//disconnect
  socket.on('disconnect', function() {
    clients = _.filter(clients, function(client) {
      return client.socket_id !== socket.id;
    });
  	console.log("disconnect:", socket.id);
  });
});

var port = process.env.PORT;

server.listen(port, function() {
	console.log('Server listening at port', port, 'in', process.env.NODE_ENV, 'mode');
});
