const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require('mocha');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  test('Convert valid input', function (done) {
    chai
      .request(server)
      .get('/api/convert?input=10L')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.initNum, 10);
        assert.equal(res.body.initUnit, "L");
        done();
      });
  });

  test('Convert invalid unit', function (done) {
    chai
      .request(server)
      .get('/api/convert?input=32g')
      .end(function (err, res) {
        assert.equal(res.body.error, 'invalid unit');
        done();
      });
  });

  test('Convert invalid number', function (done) {
    chai
      .request(server)
      .get('/api/convert?input=3/7/2kg')
      .end(function (err, res) {
        assert.equal(res.body.error, 'invalid number');
        done();
      });
  });

  test('Convert invalid number AND unit', function (done) {
    chai
      .request(server)
      .get('/api/convert?input=3/7/2kilomeg')
      .end(function (err, res) {
        assert.equal(res.body.error, 'invalid number and unit');
        done();
      });
  });

  test('Convert no number input', function (done) {
    chai
      .request(server)
      .get('/api/convert?input=kg')
      .end(function (err, res) {
        assert.equal(res.body.initNum, 1);
        assert.equal(res.body.initUnit, 'kg');
        done();
      });
  });

});
