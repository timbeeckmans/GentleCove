/* globals THREE:true */

//requires
var OBJLoader = require("../util/OBJLoader");
var Materials = require("./Materials");
var ColorSelecter = require("../controller/ColorSelecter");
var KonamiDetecter = require("../util/KonamiDetecter")

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
var floor, skyBox, camera, scene, renderer, path, geometry, controls, konamiDetecter, neo;

//arrays
var bergen, cubes, particles, spectrum;

//constants
var BERG_URL = 'models/berg.obj';
var NEO_URL = 'models/neo2.obj';
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
    _loadNeo();
	}, onProgress, onError );
}

function _loadNeo(){
	var manager = new THREE.LoadingManager();
  var loader = new THREE.OBJLoader( manager );
  $("#file").html("<span id='file'>neo</span>");
	$("#step").html("<span id='step'>3</span>");
  var onProgress = function ( xhr ) {
		console.log("update and round");
  	$("#progress").html("<span id='progress'>"+Math.round(xhr.loaded/xhr.totalSize*100)+"</span>")
  };
  var onError = function ( xhr ) {};
	loader.load( NEO_URL, function ( object ) {
    object.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        child.material = Materials.CYAN_MATERIAL;
      }
    });
    neo = object;
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
	geometry = new THREE.PlaneGeometry( 2.0, 1000, 0, 300 );
	path = new THREE.Mesh( geometry, Materials.GREEN_WIREFRAME_MATERIAL );

	path.rotation.x = 1.57;
	path.position.z = -250;
	path.position.y = 0;
	path.position.x = 0;
	scene.add( path );

	created = true;
	konamiDetecter = new KonamiDetecter();
	konamiDetecter.onKonami(_konamiHandler);
}

function _konamiHandler(){
	$("#sliderPath").val(10).change();
	$("#sliderCubes").val(10).change();
	$("#sliderBerg").val(10).change();
	$("#sliderBackground").val(10).change();
	pathColor = 10;
	bergColor = 10;
	cubeColor = 10;
	backgroundColor = 10;

	neo.position.x = 0;
	neo.position.y = 0;
	neo.position.z = -5;
	scene.add(neo);
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
