/*
 * FCC Environment Test
 * Tests the exact scenario that FCC is testing
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./server');

chai.use(chaiHttp);
const assert = chai.assert;

console.log('🧪 FCC Environment Test');
console.log('======================\n');

async function runFCCTest() {
  try {
    console.log('Testing the exact scenario that FCC is testing...');

    // Step 1: Create an issue first
    console.log('1. Creating an issue...');
    const createRes = await chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Test Issue for FCC',
        issue_text: 'This is a test issue for FCC',
        created_by: 'FCC Test User'
      });

    console.log(`Create Status: ${createRes.status}`);
    console.log(`Create Response:`, createRes.body);

    if (createRes.status !== 200) {
      console.log('❌ Failed to create issue');
      return;
    }

    const issueId = createRes.body._id;
    console.log(`✅ Created issue with ID: ${issueId}`);

    // Step 2: Test the exact failing case - update with no fields
    console.log('\n2. Testing update with no fields (the failing test)...');
    const updateRes = await chai.request(server)
      .put('/api/issues/test-project')
      .send({ _id: issueId });

    console.log(`Update Status: ${updateRes.status}`);
    console.log(`Update Response:`, updateRes.body);

    // Check if this is the exact response FCC expects
    const expectedResponse = {
      error: 'no update field(s) sent',
      '_id': issueId
    };

    if (updateRes.status === 200 &&
        updateRes.body.error === expectedResponse.error &&
        updateRes.body._id === expectedResponse._id) {
      console.log('✅ Update with no fields test PASSED - Exact FCC format!');
    } else {
      console.log('❌ Update with no fields test FAILED');
      console.log('Expected:', expectedResponse);
      console.log('Actual:', updateRes.body);
    }

    // Step 3: Clean up - delete the issue
    console.log('\n3. Cleaning up...');
    const deleteRes = await chai.request(server)
      .delete('/api/issues/test-project')
      .send({ _id: issueId });

    console.log(`Delete Status: ${deleteRes.status}`);
    console.log(`Delete Response:`, deleteRes.body);

    if (deleteRes.status === 200 && deleteRes.body.result === 'successfully deleted') {
      console.log('✅ Cleanup successful');
    } else {
      console.log('⚠️  Cleanup failed, but this is not critical');
    }

    console.log('\n🎉 FCC Environment Test Complete!');
    console.log('If the update test passed, your API should work with FCC');

  } catch (error) {
    console.error('❌ Error in FCC test:', error.message);
    console.error(error.stack);
  }
}

// Run the test
runFCCTest();