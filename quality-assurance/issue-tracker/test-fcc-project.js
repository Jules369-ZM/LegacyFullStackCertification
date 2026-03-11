/*
 * Test script to verify API works with different project names
 * This helps identify if the issue is project name related
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./server');

chai.use(chaiHttp);
const assert = chai.assert;

console.log('🧪 Testing API with different project names');
console.log('============================================\n');

// Test with different project names that FCC might use
const testProjectNames = [
  'test-project',      // Local test name
  'fcc-project',       // FCC simulator name
  'apitest',          // Default project name
  'issue-tracker',    // Common project name
  'project'           // Simple project name
];

async function testProject(projectName) {
  console.log(`\nTesting project: ${projectName}`);
  console.log('='.repeat(30));

  try {
    // Test 1: Create an issue
    console.log('1. Creating an issue...');
    const createRes = await chai.request(server)
      .post(`/api/issues/${projectName}`)
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Test User'
      });

    if (createRes.status !== 200) {
      console.log(`❌ Failed to create issue: ${createRes.status}`);
      console.log(createRes.body);
      return false;
    }

    const issueId = createRes.body._id;
    console.log(`✅ Created issue with ID: ${issueId}`);

    // Test 2: Update with no fields (this is the failing test)
    console.log('2. Testing update with no fields...');
    const updateRes = await chai.request(server)
      .put(`/api/issues/${projectName}`)
      .send({ _id: issueId });

    console.log(`Status: ${updateRes.status}`);
    console.log(`Response:`, updateRes.body);

    if (updateRes.status === 200 &&
        updateRes.body.error === 'no update field(s) sent' &&
        updateRes.body._id === issueId) {
      console.log('✅ Update with no fields test PASSED');
    } else {
      console.log('❌ Update with no fields test FAILED');
      return false;
    }

    // Test 3: Delete the issue
    console.log('3. Deleting the issue...');
    const deleteRes = await chai.request(server)
      .delete(`/api/issues/${projectName}`)
      .send({ _id: issueId });

    if (deleteRes.status === 200 && deleteRes.body.result === 'successfully deleted') {
      console.log('✅ Deleted issue successfully');
    } else {
      console.log('❌ Failed to delete issue');
      return false;
    }

    console.log(`✅ All tests passed for project: ${projectName}`);
    return true;

  } catch (error) {
    console.log(`❌ Error testing project ${projectName}:`, error.message);
    return false;
  }
}

async function runAllTests() {
  let allPassed = true;

  for (const projectName of testProjectNames) {
    const passed = await testProject(projectName);
    if (!passed) {
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL PROJECTS TESTED SUCCESSFULLY!');
  } else {
    console.log('❌ SOME PROJECTS FAILED');
  }
  console.log('='.repeat(50));
}

// Run the tests
runAllTests().catch(console.error);