const express = require('express');
const { statements, db } = require('../database');
const router = express.Router();

// GET /api/issues/:project
router.get('/issues/:project', (req, res) => {
  try {
    const project = req.params.project;

    // Build dynamic SQL query based on query parameters
    let sql = 'SELECT * FROM issues WHERE project = ?';
    let params = [project];

    // Get all query parameters except those that shouldn't be used for filtering
    const queryKeys = Object.keys(req.query);

    for (const key of queryKeys) {
      if (key !== '_id' && key !== 'project') { // Skip _id and project as they're not filter fields
        const value = req.query[key];

        // Skip empty values that shouldn't filter
        if (value === '') continue;

        // Handle boolean conversion for 'open' field
        if (key === 'open') {
          const boolValue = value === 'true' ? 1 : (value === 'false' ? 0 : null);
          if (boolValue !== null) {
            sql += ` AND ${key} = ?`;
            params.push(boolValue);
          }
        } else if (value !== undefined && value !== '') {
          sql += ` AND ${key} = ?`;
          params.push(value);
        }
      }
    }

    sql += ' ORDER BY created_on DESC';

    // Execute the dynamic query
    const issues = db.prepare(sql).all(...params);

    // Convert SQLite boolean values back to JavaScript booleans and ensure all fields are present
    const processedIssues = issues.map(issue => ({
      _id: issue._id,
      project: issue.project,
      issue_title: issue.issue_title,
      issue_text: issue.issue_text,
      created_by: issue.created_by,
      assigned_to: issue.assigned_to || '',
      status_text: issue.status_text || '',
      open: Boolean(issue.open),
      created_on: issue.created_on,
      updated_on: issue.updated_on
    }));

    res.json(processedIssues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues/:project
router.post('/issues/:project', (req, res) => {
  const project = req.params.project;
  const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

  // Validation check - return immediately if validation fails
  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  }

  try {
    // Insert new issue using prepared statement
    const result = statements.insertIssue.run(
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to || '',
      status_text || ''
    );

    // Get the inserted issue to return
    const insertedIssue = statements.getIssueById.get(result.lastInsertRowid);

    // Ensure all fields are present with empty strings if not provided
    res.json({
      _id: insertedIssue._id,
      issue_title: insertedIssue.issue_title,
      issue_text: insertedIssue.issue_text,
      created_by: insertedIssue.created_by,
      assigned_to: insertedIssue.assigned_to || '',
      status_text: insertedIssue.status_text || '',
      open: Boolean(insertedIssue.open),
      created_on: insertedIssue.created_on,
      updated_on: insertedIssue.updated_on
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:project
router.put('/issues/:project', (req, res) => {
  try {
    const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    // Check if issue exists
    const existingIssue = statements.getIssueById.get(_id);
    if (!existingIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // Check for update fields - all fields including empty strings
    const updateFields = { issue_title, issue_text, created_by, assigned_to, status_text, open };
    const hasUpdateFields = Object.keys(updateFields).some(key =>
      updateFields[key] !== undefined
    );

    if (!hasUpdateFields) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Prepare update values - allow setting to empty string
    const updateValues = [
      issue_title !== undefined ? issue_title : existingIssue.issue_title,
      issue_text !== undefined ? issue_text : existingIssue.issue_text,
      created_by !== undefined ? created_by : existingIssue.created_by,
      assigned_to !== undefined ? assigned_to : existingIssue.assigned_to,
      status_text !== undefined ? status_text : existingIssue.status_text,
      open !== undefined ? (open === 'true' || open === true ? 1 : 0) : existingIssue.open,
      _id
    ];

    const result = statements.updateIssue.run(...updateValues);

    if (result.changes > 0) {
      res.json({ result: 'successfully updated', '_id': _id });
    } else {
      res.json({ error: 'could not update', '_id': _id });
    }
  } catch (error) {
    // Make sure to return the _id in the error response
    res.json({
      error: 'could not update',
      '_id': req.body._id || 'unknown'
    });
  }
});

// DELETE /api/issues/:project
router.delete('/issues/:project', (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    // Check if issue exists before deleting
    const existingIssue = statements.getIssueById.get(_id);
    if (!existingIssue) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    const result = statements.deleteIssue.run(_id);

    if (result.changes > 0) {
      res.json({ result: 'successfully deleted', '_id': _id });
    } else {
      res.json({ error: 'could not delete', '_id': _id });
    }
  } catch (error) {
    res.json({
      error: 'could not delete',
      '_id': req.body._id || 'unknown'
    });
  }
});

module.exports = router;
