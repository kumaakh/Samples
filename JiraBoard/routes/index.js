var DelayedResponse = require('http-delayed-response');
var Promise = require('promise');

exports.index = function(req, res) {
	jira.listProjects(function(e, response) {
		if (response !== null) {
			res.render('index', {
				"title" : "JiraBoard",
				"projects" : response
			});
		} else {
			res.render('index', {
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
			});
		};

		writeLine(res, 'finding filter ' + filterParams.name + '...');
		jira.findFilter(filterParams.name, function afterFind(err, id) {
			if (id > 0) {
				writeLine(res, 'deleting filter ' + filterParams.name
						+ '...');
				jira.deleteFilter(id, function afterdelete(err, deleteResp) {
					creator();
				});
			} else {
				creator();
			}

		});
	});
}

exports.setup = function(req, res) {
	var key = req.body.key;
	var sprint = req.body.sprint.replace(/ +/g, "");
	var label = key + "-" + sprint;
	res.write('<html><head>');
	res.write('<body>');
	res.write('<H2>' + label + '</H2>');
	var delayed = new DelayedResponse(req, res);
	delayed.wait();
	var p=[];
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
	
	delayed.end(Promise.all(p).then(function(){return '</body></html>';}));
};
