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
