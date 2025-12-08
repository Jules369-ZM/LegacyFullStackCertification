const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');

const { assert, expect } = chai;
chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('GET /api/convert => conversion object', function() {

    test('Convert 10L (valid input)', function(done) {
      chai.request(app)
        .get('/api/convert')
        .query({ input: '10L' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.initNum, 10);
          assert.equal(res.body.initUnit, 'L');
          expect(res.body.returnNum).to.be.closeTo(2.64172, 0.00001);
          assert.equal(res.body.returnUnit, 'gal');
          assert.include(res.body.string, '10 L converts to');
          done();
        });
    });

    test('Convert 32g (invalid input unit)', function(done) {
      chai.request(app)
        .get('/api/convert')
        .query({ input: '32g' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'invalid unit');
          done();
        });
    });

    test('Convert 3/7.2/4kg (invalid number)', function(done) {
      chai.request(app)
        .get('/api/convert')
        .query({ input: '3/7.2/4kg' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'invalid number');
          done();
        });
    });

    test('Convert 3/7.2/4kilomegagram (invalid number and unit)', function(done) {
      chai.request(app)
        .get('/api/convert')
        .query({ input: '3/7.2/4kilomegagram' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'invalid number and unit');
          done();
        });
    });

    test('Convert kg (no number)', function(done) {
      chai.request(app)
        .get('/api/convert')
        .query({ input: 'kg' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.initNum, 1);
          assert.equal(res.body.initUnit, 'kg');
          expect(res.body.returnNum).to.be.closeTo(2.20462, 0.00001);
          assert.equal(res.body.returnUnit, 'lbs');
          done();
        });
    });

  });
});
