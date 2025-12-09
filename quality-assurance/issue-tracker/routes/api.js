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

    // Get all query parameters except _id and project
    const queryKeys = Object.keys(req.query).filter(key => key !== '_id' && key !== 'project');

    for (const key of queryKeys) {
      const value = req.query[key];

      // Skip undefined or empty string values
      if (value === undefined || value === '') continue;

      // Handle boolean conversion for 'open' field
      if (key === 'open') {
        if (value === 'true') {
          sql += ` AND open = 1`;
        } else if (value === 'false') {
          sql += ` AND open = 0`;
        }
      } else {
        // For other fields, allow filtering by any value including empty strings
        sql += ` AND ${key} = ?`;
        params.push(value);
      }
    }

    sql += ' ORDER BY created_on DESC';

    // Execute the dynamic query
    const issues = db.prepare(sql).all(...params);

    // Format the response to match FreeCodeCamp requirements
    const processedIssues = issues.map(issue => ({
      _id: issue._id,
      issue_title: issue.issue_title,
      issue_text: issue.issue_text,
      created_on: issue.created_on,
      updated_on: issue.updated_on,
      created_by: issue.created_by,
      assigned_to: issue.assigned_to || '',
      open: Boolean(issue.open),
      status_text: issue.status_text || ''
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

  // Validation check
  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  }

  try {
    // Insert new issue
    const result = statements.insertIssue.run(
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to || '',
      status_text || ''
    );

    // Get the inserted issue
    const insertedIssue = statements.getIssueById.get(result.lastInsertRowid);

    // Format response according to FreeCodeCamp requirements
    const response = {
      _id: insertedIssue._id,
      issue_title: insertedIssue.issue_title,
      issue_text: insertedIssue.issue_text,
      created_on: insertedIssue.created_on,
      updated_on: insertedIssue.updated_on,
      created_by: insertedIssue.created_by,
      assigned_to: insertedIssue.assigned_to || '',
      open: Boolean(insertedIssue.open),
      status_text: insertedIssue.status_text || ''
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:project
router.put('/issues/:project', (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  try {
    // Check if issue exists
    const existingIssue = statements.getIssueById.get(_id);
    if (!existingIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // Get update fields
    const { issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

    // Check if any update fields are provided
    const updateFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
    const hasUpdateFields = updateFields.some(field => req.body[field] !== undefined);

    if (!hasUpdateFields) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Prepare update values
    const updateValues = [
      issue_title !== undefined ? issue_title : existingIssue.issue_title,
      issue_text !== undefined ? issue_text : existingIssue.issue_text,
      created_by !== undefined ? created_by : existingIssue.created_by,
      assigned_to !== undefined ? assigned_to : existingIssue.assigned_to,
      status_text !== undefined ? status_text : existingIssue.status_text,
      open !== undefined ? (open === true || open === 'true' ? 1 : 0) : existingIssue.open,
      _id
    ];

    // Update the issue
    const result = statements.updateIssue.run(...updateValues);

    if (result.changes > 0) {
      res.json({ result: 'successfully updated', '_id': _id });
    } else {
      res.json({ error: 'could not update', '_id': _id });
    }
  } catch (error) {
    res.json({ error: 'could not update', '_id': _id });
  }
});

// DELETE /api/issues/:project
router.delete('/issues/:project', (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  try {
    // Check if issue exists
    const existingIssue = statements.getIssueById.get(_id);
    if (!existingIssue) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    // Delete the issue
    const result = statements.deleteIssue.run(_id);

    if (result.changes > 0) {
      res.json({ result: 'successfully deleted', '_id': _id });
    } else {
      res.json({ error: 'could not delete', '_id': _id });
    }
  } catch (error) {
    res.json({ error: 'could not delete', '_id': _id });
  }
});

module.exports = router;
