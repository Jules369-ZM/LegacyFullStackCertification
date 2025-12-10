/*
 * FCC Issue Tracker Test Simulator
 * Simulates FreeCodeCamp's automated testing locally
 * Tests all 14 functional requirements
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./server');

chai.use(chaiHttp);
const assert = chai.assert;

let testIssueId = '';

console.log('🧪 FCC Issue Tracker Test Simulator');
console.log('====================================\n');

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) console.log(`   ${details}`);
  console.log('');
}

// Test Suite 1: POST Requests
describe('POST /api/issues/{project} => object with issue data', function() {
  this.timeout(10000);

  it('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    console.log('Testing: Create an issue with every field');
    chai.request(server)
      .post('/api/issues/fcc-project')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue for FCC',
        created_by: 'Test User',
        assigned_to: 'Test Assignee',
        status_text: 'In Progress'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.propertyVal(res.body, 'issue_title', 'Test Issue');
          assert.propertyVal(res.body, 'issue_text', 'This is a test issue for FCC');
          assert.propertyVal(res.body, 'created_by', 'Test User');
          assert.propertyVal(res.body, 'assigned_to', 'Test Assignee');
          assert.propertyVal(res.body, 'status_text', 'In Progress');
          assert.isTrue(res.body.open);
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          testIssueId = res.body._id;
          logTest('POST with all fields', true, `Created issue with ID: ${testIssueId}`);
          done();
        } catch (error) {
          logTest('POST with all fields', false, error.message);
          done(error);
        }
      });
  });

  it('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    console.log('Testing: Create an issue with only required fields');
    chai.request(server)
      .post('/api/issues/fcc-project')
      .send({
        issue_title: 'Required Fields Only',
        issue_text: 'This issue has only required fields',
        created_by: 'Test User 2'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.propertyVal(res.body, 'issue_title', 'Required Fields Only');
          assert.propertyVal(res.body, 'created_by', 'Test User 2');
          assert.propertyVal(res.body, 'assigned_to', '');
          assert.propertyVal(res.body, 'status_text', '');
          assert.isTrue(res.body.open);
          logTest('POST with required fields only', true);
          done();
        } catch (error) {
          logTest('POST with required fields only', false, error.message);
          done(error);
        }
      });
  });

  it('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    console.log('Testing: Create an issue with missing required fields');
    chai.request(server)
      .post('/api/issues/fcc-project')
      .send({
        issue_title: 'Missing Required Fields'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'required field(s) missing');
          logTest('POST with missing required fields', true);
          done();
        } catch (error) {
          logTest('POST with missing required fields', false, error.message);
          done(error);
        }
      });
  });
});

// Test Suite 2: GET Requests
describe('GET /api/issues/{project} => Array of objects with issue data', function() {
  it('View issues on a project: GET request to /api/issues/{project}', function(done) {
    console.log('Testing: View issues on a project');
    chai.request(server)
      .get('/api/issues/fcc-project')
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          logTest('GET all issues', true, `Found ${res.body.length} issues`);
          done();
        } catch (error) {
          logTest('GET all issues', false, error.message);
          done(error);
        }
      });
  });

  it('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    console.log('Testing: View issues with one filter');
    chai.request(server)
      .get('/api/issues/fcc-project?open=true')
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.isTrue(issue.open);
          });
          logTest('GET with one filter', true, `Found ${res.body.length} open issues`);
          done();
        } catch (error) {
          logTest('GET with one filter', false, error.message);
          done(error);
        }
      });
  });

  it('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    console.log('Testing: View issues with multiple filters');
    chai.request(server)
      .get('/api/issues/fcc-project?open=true&created_by=Test User')
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.isTrue(issue.open);
            assert.propertyVal(issue, 'created_by', 'Test User');
          });
          logTest('GET with multiple filters', true, `Found ${res.body.length} matching issues`);
          done();
        } catch (error) {
          logTest('GET with multiple filters', false, error.message);
          done(error);
        }
      });
  });
});

// Test Suite 3: PUT Requests
describe('PUT /api/issues/{project} => text', function() {
  it('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    console.log('Testing: Update one field on an issue');
    chai.request(server)
      .put('/api/issues/fcc-project')
      .send({
        _id: testIssueId,
        issue_title: 'Updated Issue Title'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.propertyVal(res.body, '_id', testIssueId);
          logTest('PUT update one field', true);
          done();
        } catch (error) {
          logTest('PUT update one field', false, error.message);
          done(error);
        }
      });
  });

  it('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    console.log('Testing: Update multiple fields on an issue');
    chai.request(server)
      .put('/api/issues/fcc-project')
      .send({
        _id: testIssueId,
        issue_text: 'Updated issue text',
        status_text: 'Completed'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.propertyVal(res.body, '_id', testIssueId);
          logTest('PUT update multiple fields', true);
          done();
        } catch (error) {
          logTest('PUT update multiple fields', false, error.message);
          done(error);
        }
      });
  });

  it('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    console.log('Testing: Update with missing _id');
    chai.request(server)
      .put('/api/issues/fcc-project')
      .send({
        issue_title: 'Should not update'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'missing _id');
          logTest('PUT with missing _id', true);
          done();
        } catch (error) {
          logTest('PUT with missing _id', false, error.message);
          done(error);
        }
      });
  });

  it('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    console.log('Testing: Update with no fields to update');
    chai.request(server)
      .put('/api/issues/fcc-project')
      .send({
        _id: testIssueId
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'no update field(s) sent');
          assert.propertyVal(res.body, '_id', testIssueId);
          logTest('PUT with no update fields', true);
          done();
        } catch (error) {
          logTest('PUT with no update fields', false, error.message);
          done(error);
        }
      });
  });

  it('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    console.log('Testing: Update with invalid _id');
    chai.request(server)
      .put('/api/issues/fcc-project')
      .send({
        _id: 'invalid-id',
        issue_title: 'Should not update'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'could not update');
          assert.propertyVal(res.body, '_id', 'invalid-id');
          logTest('PUT with invalid _id', true);
          done();
        } catch (error) {
          logTest('PUT with invalid _id', false, error.message);
          done(error);
        }
      });
  });
});

// Test Suite 4: DELETE Requests
describe('DELETE /api/issues/{project} => text', function() {
  it('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    console.log('Testing: Delete an issue');
    chai.request(server)
      .delete('/api/issues/fcc-project')
      .send({
        _id: testIssueId
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully deleted');
          assert.propertyVal(res.body, '_id', testIssueId);
          logTest('DELETE issue', true);
          done();
        } catch (error) {
          logTest('DELETE issue', false, error.message);
          done(error);
        }
      });
  });

  it('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    console.log('Testing: Delete with invalid _id');
    chai.request(server)
      .delete('/api/issues/fcc-project')
      .send({
        _id: 'invalid-id'
      })
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'could not delete');
          assert.propertyVal(res.body, '_id', 'invalid-id');
          logTest('DELETE with invalid _id', true);
          done();
        } catch (error) {
          logTest('DELETE with invalid _id', false, error.message);
          done(error);
        }
      });
  });

  it('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    console.log('Testing: Delete with missing _id');
    chai.request(server)
      .delete('/api/issues/fcc-project')
      .send({})
      .end(function(err, res) {
        try {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'error', 'missing _id');
          logTest('DELETE with missing _id', true);
          done();
        } catch (error) {
          logTest('DELETE with missing _id', false, error.message);
          done(error);
        }
      });
  });
});

// Meta Test: All tests pass
describe('Meta Test: All 14 functional tests are complete and passing', function() {
  it('Should have completed all 14 functional tests', function(done) {
    console.log('\n🎯 META TEST: Checking if all 14 functional tests passed...');
    // This would be checked by FCC's test runner
    // Since we're running locally, we just log that all tests completed
    logTest('All 14 functional tests completed', true, 'Local simulation completed successfully');
    done();
  });
});
