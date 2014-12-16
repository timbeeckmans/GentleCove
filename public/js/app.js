(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./_js/app.js":[function(require,module,exports){
/* globals jQuery:true */

var detectMobileBrowser = require('./modules/util/detectmobilebrowser');
var song = "sound/wavejumper.mp3";

if(!jQuery.browser.mobile){
	//desktop
	var DesktopController = require('./modules/controller/DesktopController.js');
	var desktopController = new DesktopController(song);
	desktopController.initSocket();
}

if(jQuery.browser.mobile){
	//mobile
	if($("body").hasClass("desktop")){
		window.location.replace("/mobile");
	}

	$("#btnSubmit").click(function(e){
		e.preventDefault();
		console.log("CLICK");
		var val = $("#txtId").val();
		if(val){
			window.location.replace("/mobile/"+val);
		}
	});
}

//globale functies
window.initVisualisation = function(){
	console.log("[app.js] init visuals");
	var Visualizer = require('./modules/controller/Visualizer.js');
	var visualizer = new Visualizer(song);
};

window.initMobileController = function(){
	console.log("[app.js] init MobileController");
	var MobileController = require('./modules/controller/MobileController.js');
	var mobileController = new MobileController();
	mobileController.initSocket();
};

},{"./modules/controller/DesktopController.js":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/DesktopController.js","./modules/controller/MobileController.js":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/MobileController.js","./modules/controller/Visualizer.js":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/Visualizer.js","./modules/util/detectmobilebrowser":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/detectmobilebrowser.js"}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/3D/Environment.js":[function(require,module,exports){
/* globals THREE:true */

//requires
var OBJLoader = require("../util/OBJLoader");
var Materials = require("./Materials");
var ColorSelecter = require("../controller/ColorSelecter");

//data
var _rotationData, last_cube_pos, startPos;

//colors
var pathColor = 10;
var bergColor = 15;
var cubeColor = 10;
var backgroundColor = 25;

//booleans
var didStart, created;

//objecten
var floor, skyBox, camera, scene, renderer, path, geometry, controls;

//arrays
var bergen, cubes, particles, spectrum;

//constants
var BERG_URL = 'models/berg.obj';
var CUBES_IN_ROW, ROWS, SNELHEID;

function Environment(cubes_in_row, rows, snelheid){
	bergen = [];
	cubes = [];
	particles = [];
	CUBES_IN_ROW = Math.floor(cubes_in_row);
	ROWS = Math.floor(rows);
	SNELHEID = snelheid;
	controls = new ColorSelecter(_newColors, pathColor, cubeColor, bergColor, backgroundColor);

	_loadObj();
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize( event ) {
  renderer.setSize( window.innerWidth, window.innerHeight );
}
function _newColors(newPathColor, newCubeColor, newBergColor, newBackgroundColor){
	console.log(newPathColor, newCubeColor, newBergColor, newBackgroundColor);
	pathColor = newPathColor;
	bergColor = newBergColor;
	cubeColor = newCubeColor;
	backgroundColor = newBackgroundColor;
}

Environment.prototype.update = function(data) {
	//de updates worden al uitgevoerd voordat de scene opgebouwd is
	//errors voorkomen = (y)
	if(camera){
		if(!startPos){
			//als er geen startpositie is van het mobile device, stel deze in
			startPos = data;
		}
		_rotationData = _calculateRotation(data);
	}
};

Environment.prototype.color_change = function(data) {
	switch(data.object){
		case 0:
			pathColor = data.value;
			break;
		case 1:
			cubeColor = data.value;
			break;
		case 2:
			bergColor = data.value;
			break;
		case 3:
			backgroundColor = data.value;
			break;
	}
};

Environment.prototype.resetPosition = function() {
	//verwijder de startpositie, hierdoor wordt er een nieuwe ingestelt;
	startPos = undefined;
};

function _calculateRotation(data){
	//het verschil tussen de huidige positie en de start positie berekenen
	var dx = startPos.x - data.x;
	var dz = startPos.z - data.z;

	//iphone geeft waarden terug tussen 0 en 360.
	//dit voorkomt dat de camera derped als de huidige positie over het max / min gaat
	if(dx > 180){
		dx -= 360;
	}
	if(dx < -180){
		dx += 360;
	}

	if(dz > 180){
		dz -= 360;
	}
	if(dz < -180){
		dz += 360;
	}
	return {x: dx/180, y:dz/180};
}

function _loadObj(){
	//berg inladen
  var manager = new THREE.LoadingManager();
  var loader = new THREE.OBJLoader( manager );
  $("#file").html("<span id='file'>mountain</span>");
	$("#step").html("<span id='step'>2</span>");
  var onProgress = function ( xhr ) {
		console.log("update and round");
  	$("#progress").html("<span id='progress'>"+Math.round(xhr.loaded/xhr.totalSize*100)+"</span>")
  };
  var onError = function ( xhr ) {};

  loader.load( BERG_URL, function ( object ) {
    object.traverse( function ( child ) {
    	//traverse overloopt alle children van een object
      if ( child instanceof THREE.Mesh ) {
        child.material = Materials.CYAN_MATERIAL;
      }
    });

    //berg (object) positioneren
    object.position.y = 0;
    object.position.x = -30;
    object.position.z = -60;
    object.scale.y = 3.0;
    object.scale.x = 3.0;
    object.scale.z = 3.0;
    bergen.push(object);

    //berg kopieren en verplaatsen, ze worden in de create functie op het canvas gezet
    bergen.push(_createCopy(object, 30, -60));
    bergen.push(_createCopy(object, 50, -40));
    bergen.push(_createCopy(object, -50, -40));
    bergen.push(_createCopy(object, 70, -20));
    bergen.push(_createCopy(object, -70, -20));
    for (var i = 0; i < bergen.length; i++) {
    	bergen[i].index = Math.floor(Math.random()*175);
    }
    _create();
	}, onProgress, onError );
}

function _createCopy(object, x, z){
	var copy = object.clone();
  copy.position.x = x;
  copy.position.z = z;
  return copy;
}

Environment.prototype.setSpectrum = function(value) {
	spectrum = value;
	//check of animatie al gestart is & environment aangemaakt
	if(!didStart && created === true){
		//start animatie
		didStart = true;
		_render();
	}
};

function _create(){
	$("#preloader").remove();
	//opbouwen van de scene
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.015 );
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer();

	onWindowResize();
	document.body.appendChild( renderer.domElement );

	//achtergrond
	geometry = new THREE.PlaneGeometry( 4000, 170);
	skyBox = new THREE.Mesh( geometry, Materials.BACKGROUND_MATERIAL );
	skyBox.position.z = -100;
	skyBox.position.y = 0;

	scene.add( skyBox );
	for (var i = 0; i < bergen.length; i++) {
		scene.add( bergen[i] );
	}

	//cubes
	geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var count = 0;
	var distance = 6;
	for (i = 0; i < ROWS; i++) {
		for (var j = 0; j < CUBES_IN_ROW; j++) {
			var cube = new THREE.Mesh( geometry, Materials.CUBE_MATERIAL );
			cube.position.x = (i*2) - (ROWS - 1) - distance + 1;
			cube.position.y = 0.5;
			cube.position.z = (-j*2);
			cube.index = count;
			last_cube_pos = cube.position.z;
			scene.add( cube );
			cubes.push(cube);

			//spiegel de kubus
			var cubeCopy = cube.clone();
			cubeCopy.position.x = 5 - (i*2) - (ROWS - 1) + distance;
			cubeCopy.position.y = 0.5;
			cubeCopy.position.z = (-j*2);
			cubeCopy.index = count;
			scene.add( cubeCopy );
			cubes.push(cubeCopy);
			count++;
		}
	}

	camera.position.z = 5;
	camera.position.y = 1.3;

	//particles
	geometry = new THREE.CircleGeometry( 0.05, 16, 0, Math.PI * 2 );
	for (var k = 0; k < 200; k++) {
		var particle = new THREE.Mesh( geometry, Materials.WHITE_MATERIAL );
		_positionParticle(particle);
		particle.position.z = -(Math.random()* 500) + 5;
		particles.push(particle);
		scene.add( particle );
	}

	//grond
	geometry = new THREE.PlaneGeometry( 1000, 1000);
	floor = new THREE.Mesh( geometry, Materials.BLACK_MATERIAL );

	floor.rotation.x = 1.57;
	floor.position.z = -250;
	floor.position.y = -0.3;
	floor.position.x = 0;
	scene.add( floor );

	//pad
	geometry = new THREE.PlaneGeometry( 1.3, 1000, 0, 300 );
	path = new THREE.Mesh( geometry, Materials.GREEN_WIREFRAME_MATERIAL );

	path.rotation.x = 1.57;
	path.position.z = -250;
	path.position.y = 0;
	path.position.x = 0;
	scene.add( path );

	created = true;
}

function _positionParticle(particle){
	particle.position.x = Math.random()* 80 - 40 ;
	particle.position.y = Math.random()* 15;
}

function _musicScaleCube(cube){
	cube.position.z += SNELHEID;
	var height = spectrum[cube.index] / 100;
	if(!height){
		height = 0;
	}
	cube.scale.y += ( height - cube.scale.y ) * 0.3;
	if(cube.scale.y < 0.01){
		cube.scale.y = 0.01;
	}
	cube.position.y = 0.5 * cube.scale.y;
	return cube;
}

function _animateBerg(berg, index, mr){
	//mr = multiply rotation -> richting van rotatie
	berg.rotation.y += spectrum[100] / 4000 * mr;

	var doel = spectrum[berg.index] / 127.5;
	doel += 2.0;
	berg.scale.y += (doel - berg.scale.y) * 0.15;

}

function _updateColors(){
	var colors = Materials.PRESETS;
	path.material.color.setHex(colors[pathColor].hex);
	bergen[0].children[0].material.color.setHex(colors[bergColor].hex);
	Materials.CHANGE_BACKGROUND(colors[backgroundColor].rgb.r,
															colors[backgroundColor].rgb.g,
															colors[backgroundColor].rgb.b);
	Materials.CHANGE_CUBE(colors[cubeColor].rgb.r,
												colors[cubeColor].rgb.g,
												colors[cubeColor].rgb.b);
}

function _render() {
	requestAnimationFrame( _render );

	//animatie achtergrond
	Materials.ADD_TIME(0.05);

	//animatie bergen
	for (var i = 0; i < bergen.length; i++) {
		if(bergen[i].position.x > 0){
			_animateBerg(bergen[i], 100, 1);
		}else{
			_animateBerg(bergen[i], 100, -1);
		}
	}

	//animatie kubussen
	for (i = 0; i < cubes.length; i++) {
		_musicScaleCube(cubes[i]);
		if(cubes[i].position.z-0.5 > camera.position.z){
			cubes[i].position.z = last_cube_pos + 3.5;
		}
	}

	//animatie camera
	if(_rotationData){
		//met iphone
		camera.rotation.x += (_rotationData.y - camera.rotation.x) * 0.05;
		camera.rotation.y += (- _rotationData.x - camera.rotation.y) * 0.05;
		if(camera.rotation.x > 0.6){
			camera.rotation.x = 0.6;
		}
		if(camera.rotation.y > 0.4){
			camera.rotation.y = 0.4;
		}
		if(camera.rotation.y < -0.4){
			camera.rotation.y = -0.4;
		}
	}else{
		//zonder iphone
	}
	skyBox.rotation.y = camera.rotation.y;
	skyBox.rotation.x = camera.rotation.x;
	skyBox.scale.y = 1 + camera.rotation.x;

	//animatie particles
	for (i = 0; i < particles.length; i++) {
		particles[i].position.z += SNELHEID*5;
		if(particles[i].position.z-0.5 > camera.position.z){
			_positionParticle(particles[i]);
			particles[i].position.z = last_cube_pos;
		}
	}


	//animatie pad
	path.position.z += SNELHEID;
	if(path.position.z > -250 + 1000/300){
		path.position.z = -250;
	}

	_updateColors();

	renderer.render( scene, camera );

}

module.exports = Environment;

},{"../controller/ColorSelecter":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/ColorSelecter.js","../util/OBJLoader":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/OBJLoader.js","./Materials":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/3D/Materials.js"}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/3D/Materials.js":[function(require,module,exports){
/* globals THREE:true */

function Materials(){}

//variabellen voor shaders
var uniformsBackground = {
  time: { type: "f", value: 1.0 },
  resolution: { type: "v2", value: new THREE.Vector2() },

  //settings
  mr: { type: "f", value: 1.0 },
  mg: { type: "f", value: 0.0 },
  mb: { type: "f", value: 1.0 }
};

var uniformsCubes = {
  time: { type: "f", value: 1.0 },
  resolution: { type: "v2", value: new THREE.Vector2() },

  mr: { type: "f", value: 0.0 },
  mg: { type: "f", value: 1.0 },
  mb: { type: "f", value: 0.0 }
};

Materials.BACKGROUND_MATERIAL = new THREE.ShaderMaterial({
  uniforms: uniformsBackground,
  vertexShader: document.getElementById( 'vertexShader' ).textContent,
  fragmentShader: document.getElementById( 'fragment_shader4' ).textContent
});

Materials.CUBE_MATERIAL = new THREE.ShaderMaterial( {
  uniforms: uniformsCubes,
  vertexShader: document.getElementById( 'vertexShader' ).textContent,
  fragmentShader: document.getElementById( 'fragment_shader1' ).textContent
});

Materials.ADD_TIME = function(val){
	uniformsCubes.time.value += val;
	uniformsBackground.time.value += val;
};

Materials.CHANGE_CUBE = function(r, g, b){
	uniformsCubes.mr.value = r;
	uniformsCubes.mg.value = g;
	uniformsCubes.mb.value = b;
};

Materials.CHANGE_BACKGROUND = function(r, g, b){
	uniformsBackground.mr.value = r;
	uniformsBackground.mg.value = g;
	uniformsBackground.mb.value = b;
};

Materials.CYAN_MATERIAL = new THREE.MeshBasicMaterial( { color: 0x00ffff} );
Materials.CYAN_COLOR = {r: 0, g: 1, b:1};

Materials.WHITE_MATERIAL = new THREE.MeshBasicMaterial({color: 0xffffff});
Materials.WHITE_COLOR = {r: 1, g: 1, b:1};

Materials.BLACK_MATERIAL = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
Materials.BLACK_COLOR = {r: 0, g: 0, b:0};

Materials.GREEN_WIREFRAME_MATERIAL = new THREE.MeshBasicMaterial( {color: 0x00bb00, wireframe:true} );

Materials.PRESETS = [
	//RED
	{hex: 0xff0000,
	 rgb: {r:1, g:0, b:0}},
	{hex: 0xff3300,
	 rgb: {r:1, g:0.2, b:0}},
	{hex: 0xff6600,
	 rgb: {r:1, g:0.4, b:0}},
	{hex: 0xff9900,
	 rgb: {r:1, g:0.6, b:0}},
	{hex: 0xffcc00,
	 rgb: {r:1, g:0.8, b:0}},
	//YELLOW
	{hex: 0xffff00,
	 rgb: {r:1, g:1, b:0}},
	{hex: 0xccff00,
	 rgb: {r:0.8, g:1, b:0}},
	{hex: 0x99ff00,
	 rgb: {r:0.6, g:1, b:0}},
	{hex: 0x66ff00,
	 rgb: {r:0.4, g:1, b:0}},
	{hex: 0x33ff00,
	 rgb: {r:0.2, g:1, b:0}},
	//GREEN
	{hex: 0x00ff00,
	 rgb: {r:0, g:1, b:0}},
	{hex: 0x00ff33,
	 rgb: {r:0, g:1, b:0.2}},
	{hex: 0x00ff66,
	 rgb: {r:0, g:1, b:0.4}},
	{hex: 0x00ff99,
	 rgb: {r:0, g:1, b:0.6}},
	{hex: 0x00ffcc,
	 rgb: {r:0, g:1, b:0.8}},
	//CYAN
	{hex: 0x00ffff,
	 rgb: {r:0, g:1, b:1}},
	{hex: 0x00ccff,
	 rgb: {r:0, g:0.8, b:1}},
	{hex: 0x0099ff,
	 rgb: {r:0, g:0.6, b:1}},
	{hex: 0x0066ff,
	 rgb: {r:0, g:0.4, b:1}},
	{hex: 0x0033ff,
	 rgb: {r:0, g:0.2, b:1}},
	//BLUE
	{hex: 0x0000ff,
	 rgb: {r:0, g:0, b:1}},
	{hex: 0x3300ff,
	 rgb: {r:0.2, g:0, b:1}},
	{hex: 0x6600ff,
	 rgb: {r:0.4, g:0, b:1}},
	{hex: 0x9900ff,
	 rgb: {r:0.6, g:0, b:1}},
	{hex: 0xcc00ff,
	 rgb: {r:0.8, g:0, b:1}},
	//MAGENTA
	{hex: 0xff00ff,
	 rgb: {r:1, g:0, b:1}},
	{hex: 0xff00cc,
	 rgb: {r:1, g:0, b:0.8}},
	{hex: 0xff0099,
	 rgb: {r:1, g:0, b:0.6}},
	{hex: 0xff0066,
	 rgb: {r:1, g:0, b:0.4}},
	{hex: 0xff0033,
	 rgb: {r:1, g:0, b:0.2}},
];

module.exports = Materials;

},{}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/ColorSelecter.js":[function(require,module,exports){
var valPath, valCubes, valBerg, valBackground;
var _callback;

function ColorSelecter(callback, path, cubes, berg, background){
	valPath = path;
	valCubes = cubes;
	valBerg = berg;
	valBackground = background;
	_callback = callback;
	$("#sliderPath").on("change input",onChangePath);
	$("#sliderCubes").on("change input",onChangeCubes);
	$("#sliderBerg").on("change input",onChangeBerg);
	$("#sliderBackground").on("change input",onChangeBackground);
}

function onChangePath(e){
	e.preventDefault();
	valPath = parseInt(e.currentTarget.value);
	console.log("[ColorSelecter] onChangePath");
	console.log(parseInt(e.currentTarget.value));
	_callback(valPath, valCubes, valBerg, valBackground);
}

function onChangeCubes(e){
	e.preventDefault();
	valCubes = parseInt(e.currentTarget.value);
	console.log("[ColorSelecter] onChangeCubes");
	console.log(parseInt(e.currentTarget.value));
	_callback(valPath, valCubes, valBerg, valBackground);
}

function onChangeBerg(e){
	e.preventDefault();
	valBerg = parseInt(e.currentTarget.value);
	console.log("[ColorSelecter] onChangeBerg");
	console.log(parseInt(e.currentTarget.value));
	_callback(valPath, valCubes, valBerg, valBackground);
}

function onChangeBackground(e){
	e.preventDefault();
	valBackground = parseInt(e.currentTarget.value);
	console.log("[ColorSelecter] onChangeBackground");
	console.log(parseInt(e.currentTarget.value));
	_callback(valPath, valCubes, valBerg, valBackground);
}


module.exports = ColorSelecter;


},{}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/DesktopController.js":[function(require,module,exports){
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
	$("#container").prepend("<p>Your ID is <span id='peerid'>"+id+"</span>. Browse to </br><a class='link'>https://gentle-cove-8440.herokuapp.com/mobile/"+id+"</a></br><span class='or-margin'>or</span><p>");
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

},{"./Visualizer.js":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/Visualizer.js"}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/MobileColorSelecter.js":[function(require,module,exports){
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

},{"../util/Colors":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/Colors.js"}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/MobileController.js":[function(require,module,exports){
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

},{"./MobileColorSelecter":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/MobileColorSelecter.js"}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/controller/Visualizer.js":[function(require,module,exports){
/* globals AudioContext:true */

window.requestAnimationFrame = require('../util/requestAnimationFrame');
var Player = require("../sound/Player");
var Bufferloader = require("../sound/Bufferloader");
var Environment = require("../3D/Environment");
var player, url, spectrum, environment;

function Visualizer(song){
	url = song;
	initSong();
}

Visualizer.prototype.resetPosition = function() {
	environment.resetPosition();
};

Visualizer.prototype.color_change = function(data) {
	if(environment){
		environment.color_change(data);
	}
};

Visualizer.prototype.update = function(data) {
	if(environment){
		environment.update(data);
	}
};

function initSong(){
	$("#container").remove();
	$("body").prepend("<div id='preloader'>loading assets: <span id='file'>starting up</span> <span id='progress'>0</span>% (<span id='step'>0</span>/2) </div>");
	var context = new AudioContext();
	player = new Player(context);
	//laatste parameter is de volgende functie die hij moet uitvoeren
	var loader = new Bufferloader(context, url, startSong);
	loader.load();
}

function startSong(sound){
	//sound krijgt hij terug van de loader klasse
	this.sound = sound;
	player.play(sound);
}

function init3DEnvironment(){
	//aantal kubussen achter elkaar, rijen, snelheid van position.z animatie
	environment = new Environment((spectrum.length-85) / 4, 4, 0.05);
}

//wordt op window opgeslagen zodat de player er aan kan. Enige manier waarop Chrome niet lastig doet
window.onAudioProcessHandler = function(){
  spectrum =  new Uint8Array(player.analyser.frequencyBinCount);
  player.analyser.getByteFrequencyData(spectrum);

  if(!environment){
  	init3DEnvironment();
  }
  environment.setSpectrum(spectrum);
};

module.exports = Visualizer;

},{"../3D/Environment":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/3D/Environment.js","../sound/Bufferloader":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/sound/Bufferloader.js","../sound/Player":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/sound/Player.js","../util/requestAnimationFrame":"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/requestAnimationFrame.js"}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/sound/Bufferloader.js":[function(require,module,exports){
function BufferLoader(context, url, callback) {
	this.context = context;
	this.url = url;
	this.onload = callback;
	this.buffer = [];
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url) {
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";
	var loader = this;
	$("#file").html("<span id='file'>song</span>");
	$("#step").html("<span id='step'>1</span>");
	request.onprogress = function(e){
  	$("#progress").html("<span id='progress'>"+Math.round(e.loaded/e.totalSize*100)+"</span>");
	};

	request.onload = function() {
		loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					console.error('error decoding file data: ' + url);
					return;
				}
				loader.buffer = buffer;
				loader.onload(loader.buffer);
			},
			function(error) {
				console.error('decodeAudioData error', error);
			}
		);
	};

	request.onerror = function() {
		console.error('BufferLoader: XHR error');
	};

	request.send();
};

BufferLoader.prototype.load = function() {
	this.loadBuffer(this.url);
};

module.exports = BufferLoader;

},{}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/sound/Player.js":[function(require,module,exports){
var javascriptNode;
var analyser, source, panner, gain;

function Player(context){
	this.context = context;
}

Player.prototype.play = function(sound){
	analyser = this.analyser = this.context.createAnalyser();
  this.analyser.smoothingTimeConstant = 0.3;
  this.analyser.fftSize = 512;

  javascriptNode = this.context.createScriptProcessor(2048, 1, 1);
  javascriptNode.connect(this.context.destination);

	source = this.context.createBufferSource();
	source.buffer = sound;
	source.loop = true;
	source.start(0);

	panner = this.context.createPanner();
	panner.panningModel = 'equalPower';
	panner.setPosition(0, 0, 1 - Math.abs(0));

	gain = this.context.createGain();
	gain.gain.value = 1;

	source.connect(this.analyser);
	this.analyser.connect(javascriptNode);

	source.connect(panner);
	panner.connect(gain);
	gain.connect(this.context.destination);

	javascriptNode.onaudioprocess = window.onAudioProcessHandler;


};

module.exports = Player;

},{}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/Colors.js":[function(require,module,exports){
function Colors () {}

Colors.presets = [
	//RED
	"#ff0000",
	"#ff3300",
	"#ff6600",
	"#ff9900",
	"#ffcc00",
	//YELLOW
	"#ffff00",
	"#ccff00",
	"#99ff00",
	"#66ff00",
	"#33ff00",
	//GREEN
	"#00ff00",
	"#00ff33",
	"#00ff66",
	"#00ff99",
	"#00ffcc",
	//CYAN
	"#00ffff",
	"#00ccff",
	"#0099ff",
	"#0066ff",
	"#0033ff",
	//BLUE
	"#0000ff",
	"#3300ff",
	"#6600ff",
	"#9900ff",
	"#cc00ff",
	//MAGENTA
	"#ff00ff",
	"#ff00cc",
	"#ff0099",
	"#ff0066",
	"#ff0033"
];

module.exports = Colors;

},{}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/OBJLoader.js":[function(require,module,exports){
/* globals THREE:true */

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.OBJLoader.prototype = {

	constructor: THREE.OBJLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( text ) {

		console.time( 'OBJLoader' );

		var object, objects = [];
		var geometry, material;

		function parseVertexIndex( value ) {

			var index = parseInt( value );

			return ( index >= 0 ? index - 1 : index + vertices.length / 3 ) * 3;

		}

		function parseNormalIndex( value ) {

			var index = parseInt( value );

			return ( index >= 0 ? index - 1 : index + normals.length / 3 ) * 3;

		}

		function parseUVIndex( value ) {

			var index = parseInt( value );

			return ( index >= 0 ? index - 1 : index + uvs.length / 2 ) * 2;

		}

		function addVertex( a, b, c ) {

			geometry.vertices.push(
				vertices[ a ], vertices[ a + 1 ], vertices[ a + 2 ],
				vertices[ b ], vertices[ b + 1 ], vertices[ b + 2 ],
				vertices[ c ], vertices[ c + 1 ], vertices[ c + 2 ]
			);

		}

		function addNormal( a, b, c ) {

			geometry.normals.push(
				normals[ a ], normals[ a + 1 ], normals[ a + 2 ],
				normals[ b ], normals[ b + 1 ], normals[ b + 2 ],
				normals[ c ], normals[ c + 1 ], normals[ c + 2 ]
			);

		}

		function addUV( a, b, c ) {

			geometry.uvs.push(
				uvs[ a ], uvs[ a + 1 ],
				uvs[ b ], uvs[ b + 1 ],
				uvs[ c ], uvs[ c + 1 ]
			);

		}

		function addFace( a, b, c, d,  ua, ub, uc, ud,  na, nb, nc, nd ) {

			var ia = parseVertexIndex( a );
			var ib = parseVertexIndex( b );
			var ic = parseVertexIndex( c );
			var id;

			if ( d === undefined ) {

				addVertex( ia, ib, ic );

			} else {

				id = parseVertexIndex( d );

				addVertex( ia, ib, id );
				addVertex( ib, ic, id );

			}

			if ( ua !== undefined ) {

				ia = parseUVIndex( ua );
				ib = parseUVIndex( ub );
				ic = parseUVIndex( uc );

				if ( d === undefined ) {

					addUV( ia, ib, ic );

				} else {

					id = parseUVIndex( ud );

					addUV( ia, ib, id );
					addUV( ib, ic, id );

				}

			}

			if ( na !== undefined ) {

				ia = parseNormalIndex( na );
				ib = parseNormalIndex( nb );
				ic = parseNormalIndex( nc );

				if ( d === undefined ) {

					addNormal( ia, ib, ic );

				} else {

					id = parseNormalIndex( nd );

					addNormal( ia, ib, id );
					addNormal( ib, ic, id );

				}

			}

		}

		// create mesh if no objects in text

		if ( /^o /gm.test( text ) === false ) {

			geometry = {
				vertices: [],
				normals: [],
				uvs: []
			};

			material = {
				name: ''
			};

			object = {
				name: '',
				geometry: geometry,
				material: material
			};

			objects.push( object );

		}

		var vertices = [];
		var normals = [];
		var uvs = [];

		// v float float float

		var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// vn float float float

		var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// vt float float

		var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// f vertex vertex vertex ...

		var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

		// f vertex/uv vertex/uv vertex/uv ...

		var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

		var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

		// f vertex//normal vertex//normal vertex//normal ...

		var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

		//

		var lines = text.split( '\n' );

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			var result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				);

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				);

			} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

				// ["f 1 2 3", "1", "2", "3", undefined]

				addFace(
					result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
				);

			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

				addFace(
					result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
					result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
				);

			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

				addFace(
					result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ],
					result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ],
					result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ]
				);

			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

				addFace(
					result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
					undefined, undefined, undefined, undefined,
					result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
				);

			} else if ( /^o /.test( line ) ) {

				geometry = {
					vertices: [],
					normals: [],
					uvs: []
				};

				material = {
					name: ''
				};

				object = {
					name: line.substring( 2 ).trim(),
					geometry: geometry,
					material: material
				};

				objects.push( object );

			} else if ( /^g /.test( line ) ) {

				// group
				console.log("group");

			} else if ( /^usemtl /.test( line ) ) {

				// material

				material.name = line.substring( 7 ).trim();

			} else if ( /^mtllib /.test( line ) ) {

				// mtl file
				console.log("mtl file");

			} else if ( /^s /.test( line ) ) {

				// smooth shading
				console.log("smooth shading");

			} else {

				console.log( "THREE.OBJLoader: Unhandled line " + line );

			}

		}

		var container = new THREE.Object3D();

		for ( var j = 0, l = objects.length; j < l; j ++ ) {

			object = objects[ j ];
			geometry = object.geometry;

			var buffergeometry = new THREE.BufferGeometry();

			buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

			if ( geometry.normals.length > 0 ) {
				buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );
			}

			if ( geometry.uvs.length > 0 ) {
				buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );
			}

			material = new THREE.MeshLambertMaterial();
			material.name = object.material.name;

			var mesh = new THREE.Mesh( buffergeometry, material );
			mesh.name = object.name;

			container.add( mesh );

		}

		console.timeEnd( 'OBJLoader' );

		return container;

	}

};

},{}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/detectmobilebrowser.js":[function(require,module,exports){
/* globals jQuery:true */
/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4));})(navigator.userAgent||navigator.vendor||window.opera);

},{}],"/Users/Tim/Desktop/Howest/2014-2015/semester 1/RMD III/opdracht/code/_js/modules/util/requestAnimationFrame.js":[function(require,module,exports){
module.exports = (function(){
	return  window.requestAnimationFrame       ||
	        window.webkitRequestAnimationFrame ||
	        window.mozRequestAnimationFrame    ||
	        window.oRequestAnimationFrame      ||
	        window.msRequestAnimationFrame     ||
	        function(callback, element){
	          window.setTimeout(callback, 1000 / 60);
	        };
})();

},{}]},{},["./_js/app.js"]);
