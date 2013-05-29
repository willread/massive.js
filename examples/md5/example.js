var util = require("util");
var io = require("socket.io");
var express = require("express");
var massive = require("../../massive");

var app = require("express").createServer();

app.use("/", express.static(__dirname + "/public"));
app.use("/lib", express.static("../../public"));
app.set("view engine", "jade");
app.set("views", "../../views")

app.get("/", function(req, res){
	res.render("client");
});

app.listen(3000);

var j = new massive.Job(function(){
	this.results = [];
	
	for(ii = 0; ii < 1000; ii++){
		this.queue(function(param){
			var hash = hex_md5(Math.random() + "");
			return hash + ":" + param;
		}, "test" + ii, ii);
	}
	
	console.log(this._queue.length + " tasks generated");
}, function(result, id){
	this.results.push(result);
	console.log("Result: " + result);
	console.log("Queue remaining: " + this._queue.length);
	console.log("Assigned tasks: " + this._assigned.length);
}, function(){
	console.log("Done: " + this.results);
}, {
	port: 1234,
	dependencies: ["md5.js"]
});