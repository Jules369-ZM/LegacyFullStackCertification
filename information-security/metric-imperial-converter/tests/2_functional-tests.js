const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const { expect } = chai;
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
        expect(res.body.returnNum).to.be.closeTo(2.64172, 0.00001);
        assert.equal(res.body.returnUnit,'gal');
        assert.include(res.body.string, '10 liters converts to');
        done();
      });
  });

  test('Convert an invalid input such as 32g: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=32g')
      .end(function(err,res){
        assert.equal(res.body.error,'invalid unit');
        done();
      });
  });

  test('Convert an invalid number such as 3/7.2/4kg: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=3/7/2kg')
      .end(function(err,res){
        assert.equal(res.body.error,'invalid number');
        done();
      });
  });

  test('Convert an invalid number AND unit such as 3/7.2/4kilomegagram: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=3/7/2kilomegagram')
      .end(function(err,res){
        assert.equal(res.body.error,'invalid number and unit');
        done();
      });
  });

  test('Convert with no number such as kg: GET request to /api/convert.', function(done) {
    chai.request(server)
      .get('/api/convert?input=kg')
      .end(function(err,res){
        assert.equal(res.body.initNum,1);
        assert.equal(res.body.initUnit,'kg');
        expect(res.body.returnNum).to.be.closeTo(2.20462, 0.00001);
        assert.equal(res.body.returnUnit,'lbs');
        done();
      });
  });

});
