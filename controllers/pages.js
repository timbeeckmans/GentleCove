// routes naar de verschillende pagina's

module.exports = function(app){
	//desktop index
	app.get("/", function(req, res){
		res.render("desktop");
	});
	//desktop animatie zonder mobile
	app.get("/visualisation", function(req, res){
		res.render("visualisation", {noId: true});
	});
	//mobile index
	app.get("/mobile", function(req, res){
		//res.send("what?");
		res.render("mobileerror");
	});
	//mobile connected
	app.get("/mobile/:id", function(req, res){
		res.render("mobile", {id: req.params.id});
	});
};
