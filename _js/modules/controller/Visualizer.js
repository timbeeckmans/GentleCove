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
