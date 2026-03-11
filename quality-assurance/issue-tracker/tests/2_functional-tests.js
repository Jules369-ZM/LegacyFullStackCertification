const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(10000);
  let testIssueId;
  const project = 'testproject';

  suiteSetup(function (done) {
    if (mongoose.connection.readyState === 1) return done();
    mongoose.connection.once('connected', done);
  });

  // ─── POST Tests ────────────────────────────────────────────────────────────

  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Full Issue',
        issue_text: 'This issue has every field filled in.',
        created_by: 'Tester',
        assigned_to: 'Dev',
        status_text: 'In Progress'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Full Issue');
        assert.equal(res.body.issue_text, 'This issue has every field filled in.');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, 'Dev');
        assert.equal(res.body.status_text, 'In Progress');
        assert.isTrue(res.body.open);
        assert.property(res.body, '_id');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        testIssueId = res.body._id;
        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Required Only',
        issue_text: 'Only required fields provided.',
        created_by: 'Tester'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Required Only');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isTrue(res.body.open);
        assert.property(res.body, '_id');
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Missing Fields'
        // issue_text and created_by are missing
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // ─── GET Tests ─────────────────────────────────────────────────────────────

  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get(`/api/issues/${project}`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get(`/api/issues/${project}`)
      .query({ open: 'true' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.isTrue(issue.open);
        });
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai.request(server)
      .get(`/api/issues/${project}`)
      .query({ open: 'true', created_by: 'Tester' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.isTrue(issue.open);
          assert.equal(issue.created_by, 'Tester');
        });
        done();
      });
  });

  // ─── PUT Tests ─────────────────────────────────────────────────────────────

  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testIssueId, issue_title: 'Updated Title' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testIssueId, issue_title: 'Multi Update', issue_text: 'Updated text', assigned_to: 'NewDev' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ issue_title: 'No ID Update' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testIssueId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: 'invalid_id_123', issue_title: 'Invalid ID Test' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalid_id_123');
        done();
      });
  });

  // ─── DELETE Tests ──────────────────────────────────────────────────────────

  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({ _id: testIssueId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({ _id: 'invalid_id_456' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalid_id_456');
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});
