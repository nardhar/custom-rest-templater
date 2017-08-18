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

describe('custom rest templater on *delete* should', function() {
	var app;

	beforeEach(function() {
		app = express();
		let router = express.Router();

		router.use(customRestTemplater);
		app.use('/', router);
	});

	it('return 200 code on data sent', function(done) {
		app.delete('/', function(req, res) {
			res.customRest({name: 'myName'});
		}, customRestTemplater);

		request(app)
      .delete('/')
      .expect(200)
      .end(function(err, result) {
				should(result.body).have.keys('data', 'success', 'message');
				should(result.body).have.property('success', true);
				should(result.body).have.property('message', codes[200]);
				should(result.body.data).have.property('name', 'myName');
				done();
			});
	});

	it('return 200 code on an empty array', function(done) {
		app.delete('/', function(req, res) {
			res.customRest([]);
		}, customRestTemplater);

		request(app)
      .delete('/')
      .expect(200)
      .end(function(err, result) {
				result.body.data.should.be.an.instanceof(Array);
				result.body.data.should.be.empty;
				result.body.should.have.property('success', true);
				result.body.should.have.property('message', codes[200]);
				done();
			});
	});

	// since it is not mandatory to respond something on DELETE,
	// a successful deletion can be sent as empty too
	it('return 400 code on no data', function(done) {
		app.delete('/', function(req, res) {
			res.customRest();
		}, customRestTemplater);

		request(app)
      .delete('/')
      .expect(400)
      .end(function(err, result) {
				result.body.should.be.ok;
				should(result.body).have.property('success', false);
				should(result.body).have.property('message', codes[400]);
				done();
			});
	});

	it('return 400 code on empty data ({})', function(done) {
		app.delete('/', function(req, res) {
			res.customRest({});
		}, customRestTemplater);

		request(app)
      .delete('/')
      .expect(400)
      .end(function(err, result) {
				result.body.should.be.ok;
				should(result.body).have.property('success', false);
				should(result.body).have.property('message', codes[400]);
				done();
			});
	});

});
