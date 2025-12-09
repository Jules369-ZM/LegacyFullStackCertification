const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require('mocha');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Convert a valid input such as 10L: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=10L')
      .end(function(err,res){
        assert.equal(res.status,200);
        assert.equal(res.body.initNum,10);
        assert.equal(res.body.initUnit,'L');
        done();
      });
  });

  test('Convert an invalid input such as 32g: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=32g')
      .end(function(err,res){
        assert.equal(res.text,'invalid unit');
        done();
      });
  });

  test('Convert an invalid number such as 3/7.2/4kg: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=3/7/2kg')
      .end(function(err,res){
        assert.equal(res.text,'invalid number');
        done();
      });
  });

  test('Convert an invalid number AND unit such as 3/7.2/4kilomegagram: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=3/7/2kilomegagram')
      .end(function(err,res){
        assert.equal(res.text,'invalid number and unit');
        done();
      });
  });

  test('Convert with no number such as kg: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=L')
      .end(function(err,res){
        assert.equal(res.body.initNum,1);
        assert.equal(res.body.initUnit,'L');
        done();
      });
  });

});
