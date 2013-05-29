massive.js
==========

massive.js is a work-in-progress library for distributing computationally intensive bits of code for execution on a large number of client machines via their web browser and then processing the various results using a simple map/reduce type system.

It is comprised of a client and a server-side library which use socket.io to communicate with one another.

Much of what I've done here has been superseded by more modern techniques, such as web workers, but it's still a fun exercise.

Examples:
=========

An example is includes in `/examples` which will process the calculation of 1000 md5 sums of random numbers:

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
