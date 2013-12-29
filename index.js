var express = require('express'),
	methods = require('methods').concat('del');

function Mapping(app, path, middleware) {
	this._app = app;
	this.path = path.replace(/\/\//, '/');
	this.middleware = middleware;

	this._app.all(this.path + '/*', this.middleware);

	return this
}

Mapping.prototype.map = function () {
	var args = Router._extractArgs(arguments);
	args.fn.call(new Mapping(this._app, this.path + args.path, args.middleware))
}

methods.forEach(function(method){
	Mapping.prototype[method] = function () {
		var args = Router._extractArgs(arguments);
		this._app[method].call(this._app, this.path + args.path, args.middleware, args.fn);
		return this
	}
});

function Router(app) {
	this._app = express();
	if (app && app.hasOwnProperty('use')) app.use(this._app);
	return this
}

Router.prototype.map = function () {
	var args = Router._extractArgs(arguments);
	args.fn.call(new Mapping(this._app, args.path, args.middleware))
}

Router.__appGetter__ = function (method) {
	Router.prototype.__defineGetter__(method, function () {
		return this._app
	})
}

Router.__appGetter__('draw');
Router.__appGetter__('app');

Router._extractArgs = function (args) {
	var args = Array.prototype.slice.call(args);
	return {
		path: args.shift(),
		fn: args.pop(),
		middleware: args
	}
}

module.exports = Router;

