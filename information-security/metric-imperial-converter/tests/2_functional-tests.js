const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require('mocha');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  test('Convert valid input', (done) => {
    chai.request(server)
      .get('/api/convert?input=10L')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.initNum, 10);
        assert.equal(res.body.initUnit, 'L');
        done();
      });
  });

  test('Invalid unit', (done) => {
    chai.request(server)
      .get('/api/convert?input=32g')
      .end((err, res) => {
        assert.equal(res.text, 'invalid unit');
        done();
      });
  });

  test('Invalid number', (done) => {
    chai.request(server)
      .get('/api/convert?input=3/7.2/4kg')
      .end((err, res) => {
        assert.equal(res.text, 'invalid number');
        done();
      });
  });

  test('Invalid number and unit', (done) => {
    chai.request(server)
      .get('/api/convert?input=3/7.2/4kilomegagram')
      .end((err, res) => {
        assert.equal(res.text, 'invalid number and unit');
        done();
      });
  });

  test('No number (default to 1)', (done) => {
    chai.request(server)
      .get('/api/convert?input=kg')
      .end((err, res) => {
        assert.equal(res.body.initNum, 1);
        assert.equal(res.body.initUnit, 'kg');
        done();
      });
  });

});
