var request = require('supertest');
var express = require('express');
var should = require('should');
var codes = require('builtin-status-codes');
var customRestTemplater = require('../');

customRestTemplater.options({
	template: (object, defaultData, responseArgs) => {
		return {
			data: defaultData.status < 400 ? object : null,
			success: defaultData.status < 400,
			message: responseArgs.hasOwnProperty('message') ?
							 responseArgs.message : defaultData.message
		};
	}
});

describe('custom rest templater on *get* should', function() {
	var app;

	beforeEach(function() {
		app = express();
		let router = express.Router();

		router.use(customRestTemplater);
		app.use('/', router);
	});

	it('return 200 code on data sent', function(done) {
		app.get('/', function(req, res) {
			res.customRest({name: 'myName'});
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(200)
      .end(function(err, result) {
				result.body.should.have.keys('data', 'success', 'message');
				result.body.should.have.property('success', true);
				result.body.should.have.property('message', codes[200]);
				result.body.data.should.have.property('name', 'myName');
				done();
			});
	});

	it('return 200 code on an empty array', function(done) {
		app.get('/', function(req, res) {
			res.customRest([]);
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(200)
      .end(function(err, result) {
				result.body.data.should.be.an.instanceof(Array);
				result.body.data.should.be.empty;
				result.body.should.have.property('success', true);
				result.body.should.have.property('message', codes[200]);
				done();
			});
	});

	it('return 404 code on no data', function(done) {
		app.get('/', function(req, res) {
			res.customRest();
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(404)
      .end(function(err, result) {
				result.body.should.be.ok;
				should(result.body).have.property('success', false);
				should(result.body).have.property('message', codes[404]);
				done();
			});
	});

	it('return 404 code on empty data ({})', function(done) {
		app.get('/', function(req, res) {
			res.customRest({});
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(404)
      .end(function(err, result) {
				result.body.should.be.ok;
				should(result.body).have.property('success', false);
				should(result.body).have.property('message', codes[404]);
				done();
			});
	});

	it('return custom code (202) on successful data', function(done) {
		app.get('/', function(req, res) {
			res.customRest({name: 'myName'}, {status: 202});
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(202)
      .end(function(err, result) {
				result.body.should.be.ok;
				should(result.body).have.property('data');
				should(result.body.data).have.property('name', 'myName');
				should(result.body).have.property('success', true);
				should(result.body).have.property('message', codes[202]);
				done();
			});
	});

	it('return custom message on successful data', function(done) {
		app.get('/', function(req, res) {
			res.customRest({name: 'myName'}, {message: 'My Custom Message'});
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(200)
      .end(function(err, result) {
				result.body.should.be.ok;
				should(result.body).have.property('data');
				should(result.body.data).have.property('name', 'myName');
				should(result.body).have.property('success', true);
				should(result.body).have.property('message', 'My Custom Message');
				done();
			});
	});

	it('return custom code (202) and message on successful data', function(done) {
		app.get('/', function(req, res) {
			res.customRest({name: 'myName'}, {status: 202, message: 'My Custom Message'});
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(202)
      .end(function(err, result) {
				result.body.should.be.ok;
				should(result.body).have.property('data');
				should(result.body.data).have.property('name', 'myName');
				should(result.body).have.property('success', true);
				should(result.body).have.property('message', 'My Custom Message');
				done();
			});
	});

	it('return 200 code on no data sent but using customRestSuccess method', function(done) {
		app.get('/', function(req, res) {
			res.customRestSuccess();
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(200)
      .end(function(err, result) {
				result.body.should.have.keys('success', 'message');
				result.body.should.have.property('success', true);
				result.body.should.have.property('message', codes[200]);
				done();
			});
	});

	it('return 200 code on empty data sent but using customRestSuccess method', function(done) {
		app.get('/', function(req, res) {
			res.customRestSuccess({});
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(200)
      .end(function(err, result) {
				result.body.should.have.keys('data', 'success', 'message');
				result.body.should.have.property('data', {});
				result.body.should.have.property('success', true);
				result.body.should.have.property('message', codes[200]);
				done();
			});
	});

	it('return 404 code on data sent but using customRestFailure method', function(done) {
		app.get('/', function(req, res) {
			res.customRestFailure({name: 'myName'});
		}, customRestTemplater);

		request(app)
      .get('/')
      .expect(404)
      .end(function(err, result) {
				should(result.body).have.keys('data', 'success', 'message');
				result.body.should.have.property('data', null); // the templater overrides `data` key
				result.body.should.have.property('success', false);
				result.body.should.have.property('message', codes[404]);
				done();
			});
	});

});
