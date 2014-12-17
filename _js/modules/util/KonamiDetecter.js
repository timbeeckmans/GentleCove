var _callback;

var konami = [38,38,40,40,37,39,37,39,66,65];
var pressedKeys;

function KonamiDetecter(){
	pressedKeys = [];
}

function keyupHandler(e){
	pressedKeys.push(e.keyCode);
	var error = false;
	if(konami.length > pressedKeys.length){
		error = true;
	}
	for (var i = 0; i < pressedKeys.length; i++) {
		if(pressedKeys[i] !== konami[i]){
			error = true;
			pressedKeys = [];
		}
	}
	if(!error){
		_callback();
		$(window).off("keyup", keyupHandler);
		pressedKeys = [];
	}
}

KonamiDetecter.prototype.onKonami = function(callback) {
	$(window).on("keyup", keyupHandler);
	_callback = callback;
};

module.exports = KonamiDetecter;
