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
