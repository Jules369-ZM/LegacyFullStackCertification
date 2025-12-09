const express = require('express');
const { statements } = require('../database');
const router = express.Router();

// GET /api/issues/:project
router.get('/issues/:project', (req, res) => {
  try {
    const project = req.params.project;
    let issues = [];

    // Handle different filter combinations
    const openFilter = req.query.open;
    const createdByFilter = req.query.created_by;

    if (openFilter !== undefined && createdByFilter) {
      // Multiple filters: open and created_by
      const openValue = openFilter === 'true' ? 1 : 0;
      issues = statements.getMultiFilteredIssues.all(project, openValue, createdByFilter);
    } else if (openFilter !== undefined) {
      // Single filter: open
      const openValue = openFilter === 'true' ? 1 : 0;
      issues = statements.getFilteredIssues.all(project, openValue);
    } else {
      // No filters
      issues = statements.getIssues.all(project);
    }

    // Convert SQLite boolean values back to JavaScript booleans
    issues = issues.map(issue => ({
      ...issue,
      open: Boolean(issue.open)
    }));

    res.json(issues);
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

    res.json({
      _id: insertedIssue._id,
      issue_title: insertedIssue.issue_title,
      issue_text: insertedIssue.issue_text,
      created_by: insertedIssue.created_by,
      assigned_to: insertedIssue.assigned_to,
      status_text: insertedIssue.status_text,
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

    // Check for update fields
    const updateFields = { issue_title, issue_text, created_by, assigned_to, status_text, open };
    const hasUpdateFields = Object.values(updateFields).some(value =>
      value !== undefined && value !== ''
    );

    if (!hasUpdateFields) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Prepare update values
    const updateValues = [
      issue_title !== undefined && issue_title !== '' ? issue_title : existingIssue.issue_title,
      issue_text !== undefined && issue_text !== '' ? issue_text : existingIssue.issue_text,
      created_by !== undefined && created_by !== '' ? created_by : existingIssue.created_by,
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
    res.json({ error: 'could not update', '_id': req.body._id });
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
    res.json({ error: 'could not delete', '_id': req.body._id });
  }
});

module.exports = router;
