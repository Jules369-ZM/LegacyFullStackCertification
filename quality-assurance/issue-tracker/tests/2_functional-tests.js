const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

// Import mocha globals for test structure
const { suite, test } = require('mocha');

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
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('issue_title', 'Test Issue');
          expect(res.body).to.have.property('issue_text', 'This is a test issue');
          expect(res.body).to.have.property('created_by', 'Test User');
          expect(res.body).to.have.property('assigned_to', 'Test Assignee');
          expect(res.body).to.have.property('status_text', 'In Progress');
          expect(res.body).to.have.property('open', true);
          expect(res.body).to.have.property('created_on');
          expect(res.body).to.have.property('updated_on');
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
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('issue_title', 'Required Fields Only');
          expect(res.body).to.have.property('issue_text', 'This issue has only required fields');
          expect(res.body).to.have.property('created_by', 'Test User 2');
          expect(res.body).to.have.property('assigned_to', '');
          expect(res.body).to.have.property('status_text', '');
          expect(res.body).to.have.property('open', true);
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('error', 'required field(s) missing');
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
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.at.least(1);
          expect(res.body[0]).to.have.property('_id');
          expect(res.body[0]).to.have.property('issue_title');
          expect(res.body[0]).to.have.property('issue_text');
          expect(res.body[0]).to.have.property('created_by');
          expect(res.body[0]).to.have.property('assigned_to');
          expect(res.body[0]).to.have.property('status_text');
          expect(res.body[0]).to.have.property('open');
          expect(res.body[0]).to.have.property('created_on');
          expect(res.body[0]).to.have.property('updated_on');
          done();
        });
    });

    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .get('/api/issues/test-project?open=true')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          res.body.forEach(issue => {
            expect(issue).to.have.property('open', true);
          });
          done();
        });
    });

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .get('/api/issues/test-project?open=true&created_by=Test User')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          res.body.forEach(issue => {
            expect(issue).to.have.property('open', true);
            expect(issue).to.have.property('created_by', 'Test User');
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('result', 'successfully updated');
          expect(res.body).to.have.property('_id', testIssueId);
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('result', 'successfully updated');
          expect(res.body).to.have.property('_id', testIssueId);
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('error', 'missing _id');
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('error', 'no update field(s) sent');
          expect(res.body).to.have.property('_id', testIssueId);
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('error', 'could not update');
          expect(res.body).to.have.property('_id', 'invalid-id');
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('result', 'successfully deleted');
          expect(res.body).to.have.property('_id', testIssueId);
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
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('error', 'could not delete');
          expect(res.body).to.have.property('_id', 'invalid-id');
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test-project')
        .send({})
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('error', 'missing _id');
          done();
        });
    });

  });

});
