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
