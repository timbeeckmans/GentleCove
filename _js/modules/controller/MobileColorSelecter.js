var Colors = require("../util/Colors");
var objects = ["path", "cubes", "mountains", "background"];
var controls, _socket, _peer;
var selectedObject = 0;
var defaults = [10,10,15,25];

function MobileColorSelecter (socket, peer) {
	_socket = socket;
	_peer = peer;
	controls = createControls(Colors.presets);
	$("#container").append(controls);

	var objectNodes = $(".color-swiper");
	for (var i = 0; i < objectNodes.length; i++) {
		$(objectNodes[i]).scrollTop(160 * defaults[i]);
	}

	$(".selecter").swipe( {swipe: swipeObject, threshold:0});
	$(".color-swiper").swipe( {swipe: swipeColor, threshold:0});

}

function swipeObject(event, direction, distance, duration, fingerCount, fingerData){
	var object = event.target;
	var parent = $(object).parent().parent();
	var currentPos = parent.scrollTop();
	var destination = currentPos;
	switch(direction){
		case "up":
			destination = currentPos + 161;
			break;
		case "down":
			destination = currentPos - 161;
			break;
	}
	if(destination > (defaults.length-1) * 161){
		destination = (defaults.length-1) * 161;
	}
	parent.stop().animate({scrollTop: destination}, 200, function(){
		currentPos = parent.scrollTop();
		var index =  Math.floor(currentPos/161);
		selectedObject = index;
	});
}

function swipeColor(event, direction, distance, duration, fingerCount, fingerData){
	var object = event.target;
	var parent = $(object).parent();
	var currentPos = parent.scrollTop();
	var destination = currentPos;
	switch(direction){
		case "up":
			destination = currentPos + 160;
			break;
		case "down":
			destination = currentPos - 160;
			break;
	}
	if(destination > (Colors.presets.length-1) * 160){
		parent.scrollTop(0);
		destination = 0;
	}
	if(destination < 0){
		parent.scrollTop((Colors.presets.length-1) * 160);
		destination = (Colors.presets.length-1) * 160;
	}
	parent.stop().animate({scrollTop: destination}, 200, function(){
		currentPos = parent.scrollTop();
		var index = Math.floor(currentPos/160);
		_socket.emit("color_change", {ontvanger: _peer, change: {object: selectedObject, value: index}});
	});
}

function createControls(colors){
	var prefix = '<div id="mobile-controls"><div id="object-swiper">';
	var objectOptions = '';
	for (var i = 0; i < objects.length; i++) {
		objectOptions += '<div class="object-option" val="'+objects[i]+'"><div class="selecter"><p>'+objects[i]+'</p></div><div class="color-swiper">';
		for (var j = 0; j < colors.length; j++) {
			objectOptions += '<div class="color-option" val="'+j+'" style="background-color: '+colors[j]+'">&nbsp;</div>';
		}
		objectOptions += '</div></div>';
	}
	var suffix = '</div></div>';

	return $.parseHTML(prefix + objectOptions + suffix);
}

module.exports = MobileColorSelecter;
