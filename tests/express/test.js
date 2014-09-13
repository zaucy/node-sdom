var sdom = require(__dirname + "/../../src/main.js");
var express = require("express");

var app = express();
app.listen(80);

app.engine("html", sdom.__express);
app.set("view engine", "html");

app.get("/", function(req, res) {
	
	res.render("index", function(err, html) {
		if(err) return res.end("internal server error");
		res.end(html);
	});
});

app.use(function(req, res, next) {
	req.url
});
