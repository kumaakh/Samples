
/**
 * Module dependencies.
 */


var express = require('express')
  , config = require('./config')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var JiraApi = require('jira').JiraApi;
jira = new JiraApi('http', config.host, config.port, config.user, config.password, '2',true,false);


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


app.get('/', routes.index);

app.post('/setupsprint', routes.setup);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
