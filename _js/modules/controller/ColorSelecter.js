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

