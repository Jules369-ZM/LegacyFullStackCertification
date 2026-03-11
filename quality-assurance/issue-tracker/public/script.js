// Issue Tracker Frontend JavaScript

const API_PROJECT = 'apitest';

/* ─── helpers ─────────────────────────────────────────────────── */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showResult(containerId, result, label = '') {
  const container = document.getElementById(containerId);
  const header = label ? `<h4>${label}</h4>` : '';
  const pre = `<pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>`;
  container.innerHTML = header + pre;
}

function appendResult(containerId, result, label = '') {
  const container = document.getElementById(containerId);
  if (container.querySelector('.loading')) container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'test-result';
  const header = label ? `<h5>${label}</h5>` : '';
  wrapper.innerHTML = header + `<pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>`;
  container.appendChild(wrapper);
}

async function apiCall(method, project, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`/api/issues/${project}`, opts);
  return res.json();
}

/* ─── Section 1: API Tests ────────────────────────────────────── */
document.getElementById('submitIssueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    issue_title:  document.getElementById('submitTitle').value,
    issue_text:   document.getElementById('submitText').value,
    created_by:   document.getElementById('submitCreatedBy').value,
    assigned_to:  document.getElementById('submitAssignedTo').value,
    status_text:  document.getElementById('submitStatusText').value
  };
  const result = await apiCall('POST', API_PROJECT, data);
  showResult('resultsContainer', result, 'POST – Submit Issue');
  e.target.reset();
});

document.getElementById('updateIssueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    _id:          document.getElementById('updateId').value,
    issue_title:  document.getElementById('updateTitle').value,
    issue_text:   document.getElementById('updateText').value,
    created_by:   document.getElementById('updateCreatedBy').value,
    assigned_to:  document.getElementById('updateAssignedTo').value,
    status_text:  document.getElementById('updateStatusText').value
  };
  // Check to close issue
  if (document.getElementById('updateOpen').checked) data.open = false;

  // Strip empty optional fields
  Object.keys(data).forEach(k => {
    if (k !== '_id' && data[k] === '') delete data[k];
  });

  const result = await apiCall('PUT', API_PROJECT, data);
  showResult('resultsContainer', result, 'PUT – Update Issue');
});

document.getElementById('deleteIssueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const _id = document.getElementById('deleteId').value;
  if (!_id) return showResult('resultsContainer', { error: 'Enter an _id' });
  if (!confirm('Delete this issue?')) return;
  const result = await apiCall('DELETE', API_PROJECT, { _id });
  showResult('resultsContainer', result, 'DELETE – Delete Issue');
  e.target.reset();
});

/* ─── Section 2: Comprehensive Endpoint Testing ───────────────── */

// GET – submit
document.getElementById('getIssuesForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const project = document.getElementById('getProject').value || API_PROJECT;
  const result = await apiCall('GET', project);
  showResult('compResultsContainer', result, 'GET – All Issues');
});

// GET – with filters
document.getElementById('getIssuesWithFiltersBtn').addEventListener('click', async () => {
  const project = document.getElementById('getProject').value || API_PROJECT;
  const params = new URLSearchParams();
  const open = document.getElementById('getOpenFilter').value;
  const createdBy = document.getElementById('getCreatedByFilter').value;
  const assignedTo = document.getElementById('getAssignedToFilter').value;
  const statusText = document.getElementById('getStatusTextFilter').value;
  if (open)       params.append('open', open);
  if (createdBy)  params.append('created_by', createdBy);
  if (assignedTo) params.append('assigned_to', assignedTo);
  if (statusText) params.append('status_text', statusText);
  const url = `/api/issues/${project}${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  const result = await res.json();
  showResult('compResultsContainer', result, `GET – With Filters (${params.toString() || 'none'})`);
});

// POST – submit
document.getElementById('postIssueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const project = document.getElementById('postProject').value || API_PROJECT;
  const data = {
    issue_title: document.getElementById('postTitle').value,
    issue_text:  document.getElementById('postText').value,
    created_by:  document.getElementById('postCreatedBy').value,
    assigned_to: document.getElementById('postAssignedTo').value,
    status_text: document.getElementById('postStatusText').value
  };
  const result = await apiCall('POST', project, data);
  showResult('compResultsContainer', result, 'POST – Create Issue');
});

// POST – test missing required fields
document.getElementById('postIssueMissingBtn').addEventListener('click', async () => {
  const project = document.getElementById('postProject').value || API_PROJECT;
  const result = await apiCall('POST', project, { issue_title: 'Missing fields test' });
  showResult('compResultsContainer', result, 'POST – Missing Required Fields (expected error)');
});

// PUT – submit
document.getElementById('putIssueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const project = document.getElementById('postProject').value || API_PROJECT;
  const data = { _id: document.getElementById('putId').value };
  ['putTitle', 'putText', 'putCreatedBy', 'putAssignedTo', 'putStatusText'].forEach(id => {
    const field = {
      putTitle: 'issue_title', putText: 'issue_text', putCreatedBy: 'created_by',
      putAssignedTo: 'assigned_to', putStatusText: 'status_text'
    }[id];
    const val = document.getElementById(id).value;
    if (val) data[field] = val;
  });
  if (document.getElementById('putOpen').checked) data.open = false;
  const result = await apiCall('PUT', project, data);
  showResult('compResultsContainer', result, 'PUT – Update Issue');
});

// PUT – missing _id
document.getElementById('putIssueMissingIdBtn').addEventListener('click', async () => {
  const result = await apiCall('PUT', API_PROJECT, { issue_title: 'Should not update' });
  showResult('compResultsContainer', result, 'PUT – Missing _id (expected error)');
});

// PUT – no update fields
document.getElementById('putIssueNoFieldsBtn').addEventListener('click', async () => {
  const _id = document.getElementById('putId').value;
  if (!_id) return showResult('compResultsContainer', { error: 'Enter a valid _id first' });
  const result = await apiCall('PUT', API_PROJECT, { _id });
  showResult('compResultsContainer', result, 'PUT – No Update Fields (expected error)');
});

// PUT – invalid _id
document.getElementById('putIssueInvalidIdBtn').addEventListener('click', async () => {
  const result = await apiCall('PUT', API_PROJECT, { _id: 'invalid-id-xyz', issue_title: 'test' });
  showResult('compResultsContainer', result, 'PUT – Invalid _id (expected error)');
});

// DELETE – submit
document.getElementById('deleteFormComp').addEventListener('submit', async (e) => {
  e.preventDefault();
  const _id = document.getElementById('deleteIdComp').value;
  if (!_id) return showResult('compResultsContainer', { error: 'Enter an _id' });
  if (!confirm('Delete this issue?')) return;
  const result = await apiCall('DELETE', API_PROJECT, { _id });
  showResult('compResultsContainer', result, 'DELETE – Delete Issue');
  e.target.reset();
});

// DELETE – missing _id
document.getElementById('deleteIssueMissingIdBtn').addEventListener('click', async () => {
  const result = await apiCall('DELETE', API_PROJECT, {});
  showResult('compResultsContainer', result, 'DELETE – Missing _id (expected error)');
});

// DELETE – invalid _id
document.getElementById('deleteIssueInvalidIdBtn').addEventListener('click', async () => {
  const result = await apiCall('DELETE', API_PROJECT, { _id: 'invalid-id-xyz' });
  showResult('compResultsContainer', result, 'DELETE – Invalid _id (expected error)');
});

// Quick test – Run all scenarios
document.getElementById('testAllScenariosBtn').addEventListener('click', async () => {
  const container = document.getElementById('compResultsContainer');
  container.innerHTML = '<p class="loading">Running all test scenarios…</p>';

  // 1. Create with all fields
  const created = await apiCall('POST', API_PROJECT, {
    issue_title: 'All-fields test', issue_text: 'Full test', created_by: 'Tester',
    assigned_to: 'Dev', status_text: 'In QA'
  });
  appendResult('compResultsContainer', created, '1. POST – All fields');

  const id = created._id;

  // 2. Create with only required fields
  const req = await apiCall('POST', API_PROJECT, {
    issue_title: 'Required only', issue_text: 'Min fields', created_by: 'Tester2'
  });
  appendResult('compResultsContainer', req, '2. POST – Required fields only');

  // 3. Create with missing fields
  const missing = await apiCall('POST', API_PROJECT, { issue_title: 'No text' });
  appendResult('compResultsContainer', missing, '3. POST – Missing fields (error expected)');

  // 4. GET all
  const all = await apiCall('GET', API_PROJECT);
  appendResult('compResultsContainer', all, '4. GET – All issues');

  // 5. GET with filter
  const filtered = await (await fetch(`/api/issues/${API_PROJECT}?open=true`)).json();
  appendResult('compResultsContainer', filtered, '5. GET – Filter open=true');

  // 6. PUT – update one field
  const put1 = await apiCall('PUT', API_PROJECT, { _id: id, issue_title: 'Updated title' });
  appendResult('compResultsContainer', put1, '6. PUT – Update one field');

  // 7. PUT – missing _id
  const putNoId = await apiCall('PUT', API_PROJECT, { issue_title: 'No ID' });
  appendResult('compResultsContainer', putNoId, '7. PUT – Missing _id (error expected)');

  // 8. PUT – no fields
  const putNoFields = await apiCall('PUT', API_PROJECT, { _id: id });
  appendResult('compResultsContainer', putNoFields, '8. PUT – No update fields (error expected)');

  // 9. PUT – invalid _id
  const putInvalid = await apiCall('PUT', API_PROJECT, { _id: 'bad-id', issue_title: 'x' });
  appendResult('compResultsContainer', putInvalid, '9. PUT – Invalid _id (error expected)');

  // 10. DELETE – valid
  const del = await apiCall('DELETE', API_PROJECT, { _id: id });
  appendResult('compResultsContainer', del, '10. DELETE – Success');

  // 11. DELETE – invalid _id
  const delInvalid = await apiCall('DELETE', API_PROJECT, { _id: 'bad-id' });
  appendResult('compResultsContainer', delInvalid, '11. DELETE – Invalid _id (error expected)');

  // 12. DELETE – missing _id
  const delMissing = await apiCall('DELETE', API_PROJECT, {});
  appendResult('compResultsContainer', delMissing, '12. DELETE – Missing _id (error expected)');
});

// Quick test – Clear results
document.getElementById('clearResultsBtn').addEventListener('click', () => {
  document.getElementById('compResultsContainer').innerHTML = '<p class="loading">Results cleared.</p>';
});

// Quick test – View all issues
document.getElementById('viewAllIssuesBtn').addEventListener('click', async () => {
  const result = await apiCall('GET', API_PROJECT);
  showResult('compResultsContainer', result, `GET – All issues on "${API_PROJECT}"`);
});
