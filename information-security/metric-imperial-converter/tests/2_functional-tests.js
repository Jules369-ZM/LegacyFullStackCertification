const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require('mocha');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Convert valid input', function(done) {
    chai.request(server)
      .get('/api/convert?input=10L')
      .end(function(err,res){
        assert.equal(res.status,200);
        assert.equal(res.body.initNum,10);
        assert.equal(res.body.initUnit,'L');
        done();
      });
  });

  test('Invalid unit', function(done) {
    chai.request(server)
      .get('/api/convert?input=32g')
      .end(function(err,res){
        assert.equal(res.text,'invalid unit');
        done();
      });
  });

  test('Invalid number', function(done) {
    chai.request(server)
      .get('/api/convert?input=3/7/2kg')
      .end(function(err,res){
        assert.equal(res.text,'invalid number');
        done();
      });
  });

  test('Invalid number and unit', function(done) {
    chai.request(server)
      .get('/api/convert?input=3/7/2kilomegagram')
      .end(function(err,res){
        assert.equal(res.text,'invalid number and unit');
        done();
      });
  });

  test('No number input', function(done) {
    chai.request(server)
      .get('/api/convert?input=L')
      .end(function(err,res){
        assert.equal(res.body.initNum,1);
        assert.equal(res.body.initUnit,'L');
        done();
      });
  });

});
