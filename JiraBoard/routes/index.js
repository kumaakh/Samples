

var DelayedResponse = require('http-delayed-response');
var Promise = require('promise');
var JiraApi = require('jira').JiraApi;

exports.index = function(req, res) {
	app.locals.jira.listProjects(function(e, response) {
		if (response != null) {
			res.render('index', {
				"title" : "JiraBoard",
				"projects" : response
			});
		} else {
			res.render('sprint', {
				"title" : "JiraBoard",
				"error" : "error fetching projects"
			});
		}
	});
};

function writeLine(res, line) {
	console.log(line);
	res.write('<p>' + line + '</p>');
}

function makeFiltersGlobal(req,res)
{
	return new Promise(function(resolve, reject) {
		writeLine(res, 'changing sharing scope to global');
		jira.changeFilterShareScope(filterParams, function(err, fresp) {
			if (typeof (fresp) === 'undefined') {
				writeLine(res, 'failed changing sharing scope'+ ' : ' + err);
			} else {
				writeLine(res, 'changing sharing scope to global ');
			}
			resolve();
			console.log("makeFiltersGlobal resolved");
		});
	});
}

			
function createFilter(filterParams, req, res) {
	return new Promise(function(resolve, reject) {
		var creator = function() {
			writeLine(res, 'creating filter ' + filterParams.name + '...');
			jira.createFilter(filterParams, function(err, fresp) {
				if (typeof (fresp) === 'undefined') {
					writeLine(res, 'failed creating ' + filterParams.name
							+ ' : ' + err);
				} else {
					writeLine(res, 'created filter ' + fresp.id);
				}
				resolve();
				console.log("createFilter resolved "+filterParams.name);
			});
		};
		
		var updateor = function(filterId) {
			writeLine(res, 'updating filter ' + filterParams.name + '...');
			jira.updateFilter(filterId,filterParams, function(err, fresp) {
				if (typeof (fresp) === 'undefined') {
					writeLine(res, 'failed updating ' + filterParams.name
							+ ' : ' + err);
				} else {
					writeLine(res, 'updated filter ' + fresp.id);
				}
				resolve();
				console.log("createFilter resolved "+filterParams.name);
			});
		};

		writeLine(res, 'finding filter ' + filterParams.name + '...');
		jira.findFilter(filterParams.name, function afterFind(err, id) {
			if (id > 0) {
				updateor(id);
			} else {
				creator();
			}

		});
	});
}


//do not search for a filter: if id is supplied assume that it is to be updated
function createFilterEx(filterParams, req, res) {
	return new Promise(function(resolve, reject) {
		var creator = function() {
			writeLine(res, 'creating filter ' + filterParams.name + '...');
			jira.createFilter(filterParams, function(err, fresp) {
				if (typeof (fresp) === 'undefined') {
					writeLine(res, 'failed creating ' + filterParams.name
							+ ' : ' + err);
				} else {
					writeLine(res, 'created filter ' + fresp.id);
				}
				resolve();
				console.log("resolved createFilterEx "+filterParams.name);
			});
		};
		
		var updateor = function(filterId) {
			writeLine(res, 'updating filter ' + filterParams.name + '...');
			jira.updateFilter(filterId,filterParams, function(err, fresp) {
				if (typeof (fresp) === 'undefined') {
					writeLine(res, 'failed updating ' + filterParams.name
							+ ' : ' + err);
				} else {
					writeLine(res, 'updated filter ' + fresp.id);
				}
				resolve();
				console.log("resolved createFilterEx "+filterParams.name);
			});
		};
		if(filterParams.hasOwnProperty('id')) {
			updateor(filterParams.id);
		}
		else {
			creator();
		}
	});
}


exports.setup1 = function(req, res) {
	var key = req.body.key;
	var sprint = req.body.sprint.replace(/ +/g, "");
	var label = key + "-" + sprint;
	res.write('<html><head>');
	res.write('<body>');
	res.write('<H2>' + label + '</H2>');
	var delayed = new DelayedResponse(req, res);
	delayed.wait();
	var p=[];
	//p.push(makeFiltersGlobal(req,res));
	p.push(createFilter({
		"name" : key + "-Backlog",
		"description" : "Backlog for " + key + " project",
		"jql" : "project = "
				+ key
				+ " AND issuetype not in (Epic) AND status in (Open, Reopened) AND labels not in ("
				+ label + ") ORDER BY priority DESC",
		"favourite" : true
	},req, res));
	
	p.push(createFilter({
		"name" : key + "-ToDo",
		"description" : "ToDo for " + label,
		"jql" : "project = "
				+ key
				+ " AND issuetype not in (Epic) AND status in (Open, Reopened) AND labels in ("
				+ label + ") ORDER BY priority DESC",
		"favourite" : true
	},req, res));

	p.push(createFilter({
			"name" : key + "-WIP",
			"description" : "WIP for " + label,
			"jql" : "project = "
					+ key
					+ " AND issuetype not in (Epic) AND status in (\"In Progress\") AND labels in ("
					+ label + ") ORDER BY priority DESC",
			"favourite" : true
	},req, res));
	
	p.push(createFilter({
			"name" : key + "-Developed",
			"description" : "Developed in " + label,
			"jql" : "project = "
					+ key
					+ " AND issuetype not in (Epic) AND status in (Resolved) AND labels in ("
					+ label + ") ORDER BY priority DESC",
			"favourite" : true
	},req, res));
	
	p.push(createFilter({
		"name" : key + "-Done",
		"description" : "QA Complete in " + label,
		"jql" : "project = "
				+ key
				+ " AND issuetype not in (Epic) AND status in (Closed) AND labels in ("
				+ label + ") ORDER BY priority DESC",
		"favourite" : true
	},req, res));
	
	delayed.end(Promise.all(p).then(function(){return '</body></html>';}));
};


exports.setup = function(req, res) {
	var key = req.body.key;
	var sprint = req.body.sprint.replace(/ +/g, "");
	var label = key + "-" + sprint;
	res.write('<html><head>');
	res.write('<body>');
	res.write('<H2>' + label + '</H2>');
	var delayed = new DelayedResponse(req, res);
	var end= delayed.wait();
	//make a list of filters
	//p.push(makeFiltersGlobal(req,res));
	var f=[];
		
	//
	f.push({
		"name" : key + "-Backlog",
		"description" : "Backlog for " + key + " project",
		"jql" : "project = "
				+ key
				+ " AND issuetype not in (Epic) AND status in (Open, Reopened) AND (labels is EMPTY OR labels not in ("
				+ label + ")) ORDER BY priority DESC",
		"favourite" : true
	});
	
	f.push({
		"name" : key + "-ToDo",
		"description" : "ToDo for " + label,
		"jql" : "project = "
				+ key
				+ " AND issuetype not in (Epic) AND status in (Open, Reopened) AND labels in ("
				+ label + ") ORDER BY priority DESC",
		"favourite" : true
	});

	f.push({
			"name" : key + "-WIP",
			"description" : "WIP for " + label,
			"jql" : "project = "
					+ key
					+ " AND issuetype not in (Epic) AND status in (\"In Progress\") AND labels in ("
					+ label + ") ORDER BY priority DESC",
			"favourite" : true
	});
	
	f.push({
			"name" : key + "-Developed",
			"description" : "Developed in " + label,
			"jql" : "project = "
					+ key
					+ " AND issuetype not in (Epic) AND status in (Resolved) AND labels in ("
					+ label + ") ORDER BY priority DESC",
			"favourite" : true
	});
	
	f.push({
		"name" : key + "-Done",
		"description" : "QA Complete in " + label,
		"jql" : "project = "
				+ key
				+ " AND issuetype not in (Epic) AND status in (Closed) AND labels in ("
				+ label + ") ORDER BY priority DESC",
		"favourite" : true
	});
	
	var ps=[];
	jira.findFilters(f,function(err,result){
			if(result==null){
				writeLine(res,"error finding filters");
				end(null,'</body></html>');
				return;
			}
			jira.changeFilterShareScope(true,function(err,resp){
				if(err!=null) {
					writeLine("can not make filter scope global! please do it manually");
				}
				var p = null;
				for(var k=0;k<f.length;k++){
					ps.push(createFilterEx(f[k],req,res));
				}
				console.log("resolved findfilter");
				end(Promise.all(ps).then(function(){ console.log("ending now"); return '</body></html>';}));
			});
		});
};



/**
 * login 
 */

exports.login = function(req, res) {
	jira = new JiraApi(config.proto, req.body.url, config.port, req.body.user, req.body.password, '2',true,config.strictSSL,false,config.isLocal);
	jira.listProjects(function(e, response) {
		if (response != null) {
			//console.log(response);
			console.log("Logged in to Jira!");
			app.locals.jira=jira;
			app.locals.projects=response; //lets remember the projects
			res.render('index', {
				"title" : "JiraBoard",
			});
			
		} else {
			console.log("Failed login "+e);
			delete app.locals.jira;
			delete app.locals.projects;
			res.render('login', {
				"title" : "JiraBoard",
				"error" : "error Logging in. Please try again..."
			});
		}
	});
};
