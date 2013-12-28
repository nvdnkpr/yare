
/**
 * Module dependencies.
 */

var express = require('express'),
	assert = require('assert'),
	request = require('supertest'),
	Router = require('..'),
	pending = require('./support/pending');

describe('Router', function () {
	it('should be able to extract path, fn, and middleware from arguments', function (done) {
		function extractable() {
			return Router._extractArgs(arguments)
		}
		var args = extractable(1, 2, 3, 4);
		
		assert.equal(args.path, 1)
		assert.equal(args.fn, 4)
		assert.equal(args.middleware, [2,3].toString())
		done()
	})
	
	it('should return draw', function (done) {
		var router = new Router();
		
		assert.equal(router._app, router.draw)
		done()
	})
	
	it('should have an express app', function (done) {
		var router = new Router(),
			app = router._app,
			done = pending(2, done);

	    app.get('/one', function(req, res){
	      res.send('GET one');
	    });
	
	    app.get('/some/two', function(req, res){
	      res.send('GET two');
	    });
	
	    request(app)
	    .get('/one')
	    .expect('GET one', done);
	
	    request(app)
	    .get('/some/two')
	    .expect('GET two', done);
	})
	
	it('should be able to take an express app and mount itself', function (done) {
		var app = express(),
			router = new Router(app);
			
		router.map('/a', function () {
			this.get('/b', function (req, res) {
				res.send('b')
			})
		})
		request(app)
		.get('/a/b')
		.expect('b', done)
	})
	
	it('should be mountable', function (done) {
		var app = express(),
			router = new Router();
		
		router.map('/a', function () {
			this.get('/b', function (req, res) {
				res.send('b')
			})
		})
		app.use(router.draw);
		
		request(app)
		.get('/a/b')
		.expect('b', done)
	})
	
	it('shoule handle middleware', function (done) {
		var app = express(),
			router = new Router(app);

		function loadFoo (req, res, next) {req.foo = 'foo'; next()}			
		function loadBar (req, res, next) {req.bar = 'bar'; next()}			
		function loadBaz (req, res, next) {req.baz = 'baz'; next()}
			
		router.map('/bar', loadFoo, loadBar, function () {
			this.get('/baz', loadBaz, function (req, res) {
				res.send([req.foo,req.bar,req.baz].join('&'))
			})
		})
		request(app)
		.get('/bar/baz')
		.expect('foo&bar&baz', done)
	})
	
	it("should be able to lookup parent views", function (done) {
		var app = require('./dummy/app'),
			done = pending(3, done)
			
			request(app)
			.get('/')
			.expect('test', done)
			
			request(app)
			.get('/a')
			.expect('test', done)
			
			request(app)
			.get('/a/b')
			.expect('test', done)
	})
})
