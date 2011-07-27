var util = require("util");
var io = require("socket.io");
var express = require("express");

var app = require('express').createServer();

app.use("/", express.static(__dirname + '/'));

app.get('/', function(req, res){

	res.send(req.params);

});

app.listen(3000);

var Job = function($function, $callback, $port){

	this._queue = [];
	this._function = $function;
	this._callback = $callback;
	this._results;
	
	this._function(); // Run supplied function, should be synchronous?
	
	this._io = io.listen($port);
	this._io.set("log level", 0);
	
	var scope = this;
	
	this._io.sockets.on("connection", function(socket){
		
		console.log("Client connected");
		
		// Client wants something to do!
		
		socket.on("ready", function(){
			
			console.log("Client ready");
			if(scope._queue.length > 0)
				socket.emit("task", scope._queue.pop());
		
		});
		
		socket.on("finished", function($results){
		
			scope._callback($results);
			if(scope._queue.length > 0)
				socket.emit("task", scope._queue.pop());
		
		});
	
	});
	
}

Job.prototype.queue = function($task){

	var task = $task.toString(); // Serialize function
	this._queue.push(task); // Add to queue

}

var j = new Job(function(){

	for(ii = 0; ii < 999; ii++){
		
		var scope = this;
		
		setTimeout(function(){
	
			scope.queue(function(){
				for(ii = 0; ii < 10000000; ii++){
					var result = ii;
				}
				return Math.random();;
			});
			
		}, 1);
	
	}

}, function(data){
	
	console.log("Result: " + data);
	console.log("Queue remaining: " + this._queue.length);

}, 1234)