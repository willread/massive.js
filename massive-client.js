var Massive = function(){
	
	this.tasks = [];
	this.busy = false;
	this.paused = true;
	this.socket;
}

Massive.prototype.connect = function($host, $port){

	var scope = this;

	this.socket = io.connect("ws://" + $host + ":" + $port);
	
	this.socket.on("connect", function(connection){
	});
	
	this.socket.on("dependencies", function($dependencies){
	
		this.dependenciesToLoad = $dependencies.length;

		for(d in $dependencies){
			
			var scope = this;
			
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = $dependencies[d];
			script.onload = function(){
				
				scope.dependenciesToLoad --;
				if(scope.dependenciesToLoad <= 0)
					scope.socket.emit("ready");
				
			}
			document.body.appendChild(script);
		
		}
	
	});
	
	this.socket.on("task", function ($task){
		scope.tasks.push($task);
	});
	
	setInterval(function(){
		if(scope.tasks.length <= 0){
			scope.socket.emit("ready");
		}else{
			if(!scope.paused && !scope.busy){
				scope.busy = true;
				var task = scope.tasks.pop();
				console.log("Task:");
				console.log(task);
				eval("code = " + task.task)
				var result = code(task.param);
				scope.socket.emit("finished", result, task.id);
				scope.busy = false;
			}
		}
	}, 100);

}

Massive.prototype.start = function(){
	this.paused = false;
}

Massive.prototype.stop = function(){
	this.paused = true;
}