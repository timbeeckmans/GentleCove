/* globals io:true */

var socket, _id, _visualizer, _song;

function DesktopController(song){
	_song = song;
}

DesktopController.prototype.initSocket = function() {
	socket = io('/');
	socket.on('socket_id', _onSocketId);

	//interacties met mobile
	socket.on("foundMobileDevice", _onFoundMobileDevice);
	socket.on("mobileDeviceAccept", _onMobileDeviceAccept);
	socket.on("resetPosition", _onResetPosition);
};

function _onResetPosition(){
	_visualizer.resetPosition();
}

function _onSocketId(id){
	_id = id;
	console.log("id:", id);

	//verwijder de "wacht op connectie" boodschap
	$("#not-connected").remove();
	$("#container").prepend("<p>Your ID is <span id='peerid'>"+id+"</span>. Browse to </br><a class='link'>localhost:3000/mobile/"+id+"</a></br><span class='or-margin'>or</span><p>");
}

function _onFoundMobileDevice(id){}

function _onMobileDeviceAccept(){
	//verwijder de tekst en maak het canvas aan
	$("#bg").remove();
	$("footer").remove();
	$("#container").remove();
	console.log("[app.js] init visuals");
	var Visualizer = require('./Visualizer.js');
	_visualizer = new Visualizer(_song);
	socket.on("update", _update);
	socket.on("color_change", _color_change);
}

function _color_change(data){
	if(_visualizer){
		_visualizer.color_change(data);
	}
}

function _update(data){
	if(_visualizer){
		_visualizer.update(data);
	}
}

module.exports = DesktopController;
