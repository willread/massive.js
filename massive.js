// TODO: Give tasks to someone else if worker takes too long

var io = require("socket.io");

exports.Job = function($function, $callback, $finished, $options){

	this._queue = [];
	this._assigned = [];
	this._function = $function;
	this._callback = $callback;
	this._finished = $finished;
	
	// Default options
	this._options = {
		port: 1234,
		dependencies: []
	};
	
	// Override default options with those provided
	if(typeof $options == "object"){
		for(o in $options){
			if(typeof this._options[o] != "undefined")
				this._options[o] = $options[o];
		}
	}
	
	this._function(); // Run supplied function
	
	this._io = io.listen(this._options.port);
	this._io.set("log level", -1);
	
	var scope = this;
	
	this._io.sockets.on("connection", function(socket){
		
		socket.emit("dependencies", scope._options.dependencies);
		
		// Client wants something to do!
		
		socket.on("ready", function(){
		
			if(scope._queue.length > 0){
				var task = scope._queue.pop();
				task.startTime = new Date().getTime();
				scope._assigned.push(task);
				socket.emit("task", task);
			}
		
		});
		
		socket.on("finished", function($results, $id){
			
			// Remove from assigned tasks array
			
			var taskToRemove = -1;
			for(a in scope._assigned){
			
				if(scope._assigned[a].id == $id)
					taskToRemove = a;
			
			}
			if(taskToRemove > -1)
				scope._assigned.splice(taskToRemove, 1);
			
			// Send returned data to callback function
			
			scope._callback($results, $id);
			
			// Finish up if no tasks left
			
			if(scope._queue.length <= 0 && scope._assigned.length <= 0){
				scope._finished();
			}
		
		});
	
	});
	
}

exports.Job.prototype.queue = function($task, $id){

	var task = $task.toString(); // Serialize function
	this._queue.push({
		"id": $id,
		"task": task,
		"startTime": 0
	}); // Add to queue

}

exports.Job.prototype.assign = function(){

}