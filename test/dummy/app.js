// cd into dummy app so paths resolve properly
process.chdir('./test/dummy')

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var Router = require('../..');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
var routerA = new Router();
routerA.map('/', function () {
	this.get('', routes.index);
})
app.use(routerA.draw)

var routerB = new Router(app);
routerB.map('', function () {
	this.get('/a', routes.index);
	this.map('/a', function () {
		this.get('/b', routes.index)
	});
	
})

if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
}
module.exports = app;