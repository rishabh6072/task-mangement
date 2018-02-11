var bodyParser   = require("body-parser");
var express = require("express");
var mongoose = require("mongoose");
var app = express();
app.use(bodyParser.urlencoded({extended: true}));	
var url = "mongodb://localhost/assignment"
mongoose.connect(url);

var taskSchema = new mongoose.Schema({
    stage: {
		name: String,
		progress_percent: Number
	},
	created_by: String,
	description: String,
	assignee: String,
	sub_tasks: Array,
	history: Array
	
});
var stagesSchema = new mongoose.Schema({
	name: String,
	progress_percent: Number
});
var userSchema = new mongoose.Schema({
	username: String,
	is_admin: Boolean
});
Tasks = mongoose.model("tasks", taskSchema)
Users = mongoose.model("users", userSchema)
Stages = mongoose.model("stages", stagesSchema)



//Stages Routes
app.get("/stages", function(req, res){
//	stages =[];
	Stages.find({}, function(err, foundStages){
//		stages = docs;
		if(err){
			res.json({"success": false, "error": err.message }, 400);
		} else {
			res.json(foundStages);
		}
	});
});

app.post("/stages", function(req, res){
	var name= req.body.name;
	var	progress_percent= req.body.progress_percent;
	var newStage = {name: name, progress_percent: progress_percent};
		Stages.create(newStage, function(err , newly){
			if(err){
				res.json({"success": false, "message": "name is not defined"});
			} else {
				res.json({"success": true, "message": "Stage created"});
			}
		});
});

app.get("/stages/:id", function(req, res){
	Stages.findById(req.params.id, function(err, foundStage){
		if(err){
			res.json({"success": false, "error": err.message }, 400);
		} else {
			res.json(foundStage);
		}
	});
});

app.put("/stages/:id", function(req, res){
	var name= req.body.name;
	var	progress_percent= req.body.progress_percent;
	var newStage = {name: name, progress_percent: progress_percent};
	Stages.findByIdAndUpdate(req.params.id, newStage, function(err, updatedStage){
		if(err){
			res.json(err);
		} else {
			res.json({"success": true, "message": "Successfully edited"})
		}
	});
});

app.delete("/stages/:id", function(req, res){
	Stages.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.json(err);
		} else {
			res.json({"success": true, "message": "deleted"})
		}
	});
});



//Users Routes
app.get("/users", function(req, res){
	Users.find({}, function(err, foundUsers){
		if(err){
			res.json({"success": false, "error": err.message }, 400);
		}
		res.json(foundUsers);
	});
});

app.post("/users" ,function(req, res){
	var name = req.body.name;
	var gender = req.body.gender;
	var city = req.body.city;
	var newUser = { name: name, gender: gender, city: req.body.city};
	Users.create(newUser, function(err){
		if(err){
			res.json(err);
		} else {
			res.json({"success": true, "message": "User Created"})
		}
	});
});

app.get("/users/:id", function(req, res){
	Users.findById(req.params.id, function(err, foundUser){
		if(err){
			res.json(err);
		} else {
			res.json(foundUser);	
		}
	});
});

app.put("/users/:id", function(req, res){
	var username = req.body.username;
	var is_admin = req.body.is_admin;
	var newUser = {username: username, is_admin: is_admin}
	Users.findByIdAndUpdate(req.params.id, newUser, function(err){
		if(err){
			res.json(err);
		} else {
			res.json({"success": true, "message": "User Updated"})
		}
	});
});

app.delete("/users/:id", function(req, res){
	Users.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.json(err);
		} else {
			res.json({"success": true, "message": "Successfully removed" })
		}
	});
});



//Tasks Routes
app.get("/tasks", function(req, res){
    tasks = []
//	if (request.params.username)
	Tasks.find({username: req.body.username}, function(error, docs){
		tasks = docs;
		res.json(tasks);
	});
	// ensure you change the status based on sub tasks
});

// create method??
app.post("/tasks", function(req, res){
	username = req.body.username;
	Users.find({username: username}, function(err, docs){
		if (err) {
			res.json({"status": false, "message": "Cannot create task without user name specified"});
		}
		if (docs.length > 0) {
			user = docs[0];
			if (! user.is_admin == true) {
				res.json({"status": false, "message": "You must be an admin for creating a task"});
			}
			else {
				getStage(req.body, res);
			}	
		}
		else {
			res.json({"status": false, message: "Invaid User"});
		}
	});
});



app.get("/tasks/:id", function(req, res){
	Tasks.findById(req.params.id, function(err, foundTasks){
		if(err){
			res.json(err)
		} else {
			res.json(foundTasks);
		}
	});
});

app.put("/tasks/:id", function(req, res){
	var stage = req.body.stage;
	var created_by = req.body.created_by;
	var description = req.body.description;
	var assignee = req.body.assignee;
	var sub_tasks = req.body.sub_tasks;
	var history = req.body.history;
	var newTasks = {stage: stage , created_by: created_by, description: description, assignee: assignee, sub_tasks: sub_tasks, history: history}
	Tasks.findByIdAndUpdate(req.params.id, newTasks, function(err){
		if(err){
			res.json(err);
		} else {
			res.json({"success": true, "message": "Task Updated"});
		}
	});
});

app.delete("/tasks/:id", function(req, res){
	Tasks.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.json(err);
		} else {
			res.json({"success": true, "message": "Task successfully deleted"});
		}
	});
});

getStage = function(task, res) {
	Stages.find({name: task.stage}, function(err,docs) {
		if (err) {
			res.json({"success": false, "message": "Incorrect Stage"});
		}
		if (docs.length > 0){
			createTask(task, docs[0], res);
		}
		else {
			res.json({"success": false, "message": "Incorrect Stage"});
		}
	});
}

createTask = function(task, stage, res) {
	delete(stage["_id"]);
	Tasks.create({
		stage: stage,
		assignee: task.assignee,
		history: ["task_created"],
		description: task.description,
		sub_tasks: task.sub_tasks,
		created_by: task.username
	});
	res.json({"success": true, "message": "Successfully created task!"});
}



app.listen(8080, "localhost", function(){
    console.log("server started");
    console.log();
});
