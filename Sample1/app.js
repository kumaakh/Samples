
/**
 * Module dependencies.
 */


var express = require('express')
  , http = require('http')
  , path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/test', function(req, res){
	var pipeline = require('when/pipeline');
	var DelayedResponse =require('http-delayed-response');
	var delayed = new DelayedResponse(req, res);
	delayed.wait();
	var i=0;
    var pre= function(v){
    	console.log('pre called with '+i);
    	res.write('<html><body>');
    	};
    var f= function(v){
    	console.log('f called with '+i);
    	res.write('<p>Line '+(i++)+'</p>');
    	};
    var post1= function(v){
    	console.log('post called with '+i);
    	res.write('</html></body>');
    	};

    delayed.end(pipeline([pre,f,f,post1]));
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
