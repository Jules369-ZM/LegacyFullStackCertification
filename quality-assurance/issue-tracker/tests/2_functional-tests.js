const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

// Add this at the top of both test files
const mocha = require('mocha');
const suite = mocha.suite;
const test = mocha.test;
// OR use global mocha functions
// const { suite, test } = mocha;
chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);

  let testIssueId;

  suite('POST /api/issues/{project} => object with issue data', function() {

    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a test issue',
          created_by: 'Test User',
          assigned_to: 'Test Assignee',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.propertyVal(res.body, 'issue_title', 'Test Issue');
          assert.propertyVal(res.body, 'issue_text', 'This is a test issue');
          assert.propertyVal(res.body, 'created_by', 'Test User');
          assert.propertyVal(res.body, 'assigned_to', 'Test Assignee');
          assert.propertyVal(res.body, 'status_text', 'In Progress');
          assert.isTrue(res.body.open);
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          testIssueId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Required Fields Only',
          issue_text: 'This issue has only required fields',
          created_by: 'Test User 2'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.propertyVal(res.body, 'issue_title', 'Required Fields Only');
          assert.propertyVal(res.body, 'issue_text', 'This issue has only required fields');
          assert.propertyVal(res.body, 'created_by', 'Test User 2');
          assert.propertyVal(res.body, 'assigned_to', '');
          assert.propertyVal(res.body, 'status_text', '');
          assert.isTrue(res.body.open);
          done();
        });
    });

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .post('/api/issues/test-project')
        .send({
          issue_title: 'Missing Required Fields'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'required field(s) missing');
          done();
        });
    });

  });

  suite('GET /api/issues/{project} => Array of objects with issue data', function() {

    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .get('/api/issues/test-project')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          done();
        });
    });

    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .get('/api/issues/test-project?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.isTrue(issue.open);
          });
          done();
        });
    });

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .get('/api/issues/test-project?open=true&created_by=Test User')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.isTrue(issue.open);
            assert.propertyVal(issue, 'created_by', 'Test User');
          });
          done();
        });
    });

    test('View issues on a project with arbitrary field filter: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .get('/api/issues/test-project?assigned_to=Test Assignee')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.propertyVal(issue, 'assigned_to', 'Test Assignee');
          });
          done();
        });
    });

  });

  suite('PUT /api/issues/{project} => text', function() {

    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .put('/api/issues/test-project')
        .send({
          _id: testIssueId,
          issue_title: 'Updated Issue Title'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.propertyVal(res.body, '_id', testIssueId);
          done();
        });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .put('/api/issues/test-project')
        .send({
          _id: testIssueId,
          issue_text: 'Updated issue text',
          status_text: 'Completed'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.propertyVal(res.body, '_id', testIssueId);
          done();
        });
    });

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .put('/api/issues/test-project')
        .send({
          issue_title: 'Should not update'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .put('/api/issues/test-project')
        .send({
          _id: testIssueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'no update field(s) sent');
          assert.propertyVal(res.body, '_id', testIssueId);
          done();
        });
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .put('/api/issues/test-project')
        .send({
          _id: 'invalid-id',
          issue_title: 'Should not update'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'could not update');
          assert.propertyVal(res.body, '_id', 'invalid-id');
          done();
        });
    });

  });

  suite('DELETE /api/issues/{project} => text', function() {

    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test-project')
        .send({
          _id: testIssueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully deleted');
          assert.propertyVal(res.body, '_id', testIssueId);
          done();
        });
    });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test-project')
        .send({
          _id: 'invalid-id'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'could not delete');
          assert.propertyVal(res.body, '_id', 'invalid-id');
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test-project')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'missing _id');
          done();
        });
    });

  });

});
