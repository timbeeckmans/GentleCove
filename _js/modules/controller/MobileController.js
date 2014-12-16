/* globals io:true */

var socket, _id, _peer_id, _peer_socket_id, mobileControl;
var MobileColorSelecter = require("./MobileColorSelecter");

function MobileController(){}

MobileController.prototype.initSocket = function() {
	_peer_id = $("#connection-id").html();
	socket = io('/');
	socket.on('socket_id', _onSocketId);
	socket.on('wrongId', _onWrongId);
	socket.on('validate', _onValidate);
};

function _onWrongId(){
	window.location.replace("/mobile");
}

function _onValidate(peer_socket_id){
	_peer_socket_id = peer_socket_id;
}

function _onSocketId(id){
	_id = id;
	var data = {
		id: _id,
		peer_id: _peer_id
	};
	socket.emit("mobileConnection", data);

	$("#btnStart").click(function(){
		//start de animatie op de desktop
		socket.emit("mobileAccept", _peer_socket_id);

		window.ondeviceorientation = onOrientation;
		_updateInterface();
	});
}

function onOrientation(event){
	var orientationX = _round(event.alpha);
  var orientationY = _round(event.beta);
  var orientationZ = _round(event.gamma);
	socket.emit("update", {
		ontvanger: _peer_socket_id,
		rotatie: {
			x: orientationX,
			y: orientationY,
	 		z: orientationZ
	 	}
 	});
}

function _updateInterface(){
	//verwijder de startknop en maak de nieuwe interface aan
	$("#btnStart").remove();
	$("#container").html("<p class='no-margin'>Tilt your device to look around.</p>");
	$("#container").append("<input type='button' value='Reset position' id='btnReset'/>");
	mobileControl = new MobileColorSelecter(socket, _peer_socket_id);
	$("#btnReset").click(_resetPosition);
}

function _resetPosition(){
	socket.emit("resetPosition", _peer_socket_id);
}

function _round(number){
	return Math.round(number*100)/100;
}

module.exports = MobileController;
