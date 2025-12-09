const express = require('express');
const { statements, db } = require('../database');
const router = express.Router();

// GET /api/issues/:project
router.get('/issues/:project', (req, res) => {
  const project = req.params.project;

  // Build query based on filters
  let sql = 'SELECT * FROM issues WHERE project = ?';
  const params = [project];

  // Handle all possible filters
  const validFilters = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];

  validFilters.forEach(filter => {
    if (req.query[filter] !== undefined && req.query[filter] !== '') {
      if (filter === 'open') {
        // Handle boolean for 'open' field
        const boolValue = req.query[filter] === 'true' ? 1 : 0;
        sql += ` AND open = ?`;
        params.push(boolValue);
      } else {
        // Handle string fields - allow filtering by empty string too
        sql += ` AND ${filter} = ?`;
        params.push(req.query[filter]);
      }
    }
  });

  sql += ' ORDER BY created_on DESC';

  try {
    const issues = db.prepare(sql).all(...params);

    // Format response exactly as FCC expects
    const formattedIssues = issues.map(issue => ({
      _id: issue._id,
      issue_title: issue.issue_title,
      issue_text: issue.issue_text,
      created_on: issue.created_on,
      updated_on: issue.updated_on,
      created_by: issue.created_by,
      assigned_to: issue.assigned_to || '',  // Always include as empty string if null
      open: issue.open === 1,  // Must be boolean true/false
      status_text: issue.status_text || ''  // Always include as empty string if null
    }));

    res.json(formattedIssues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues/:project
router.post('/issues/:project', (req, res) => {
  const project = req.params.project;
  const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

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
      assigned_to,
      status_text
    );

    // Get the inserted issue
    const insertedIssue = statements.getIssueById.get(result.lastInsertRowid);

    // Format response according to FCC requirements
    const response = {
      _id: insertedIssue._id,
      issue_title: insertedIssue.issue_title,
      issue_text: insertedIssue.issue_text,
      created_on: insertedIssue.created_on,
      updated_on: insertedIssue.updated_on,
      created_by: insertedIssue.created_by,
      assigned_to: insertedIssue.assigned_to || '',
      open: insertedIssue.open === 1,
      status_text: insertedIssue.status_text || ''
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:project
router.put('/issues/:project', (req, res) => {
  const { _id, ...updateFields } = req.body;

  // Check for _id
  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  // Remove empty fields from updateFields
  const filteredUpdateFields = {};
  Object.keys(updateFields).forEach(key => {
    if (updateFields[key] !== undefined) {
      filteredUpdateFields[key] = updateFields[key];
    }
  });

  // Check if any fields to update (excluding _id)
  if (Object.keys(filteredUpdateFields).length === 0) {
    return res.json({ error: 'no update field(s) sent', '_id': _id });
  }

  try {
    // Check if issue exists - convert _id to number if it's numeric
    const issueId = isNaN(_id) ? _id : parseInt(_id);
    const existingIssue = statements.getIssueById.get(issueId);

    if (!existingIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // Build update object
    const updateData = {
      issue_title: filteredUpdateFields.issue_title !== undefined ? filteredUpdateFields.issue_title : existingIssue.issue_title,
      issue_text: filteredUpdateFields.issue_text !== undefined ? filteredUpdateFields.issue_text : existingIssue.issue_text,
      created_by: filteredUpdateFields.created_by !== undefined ? filteredUpdateFields.created_by : existingIssue.created_by,
      assigned_to: filteredUpdateFields.assigned_to !== undefined ? filteredUpdateFields.assigned_to : existingIssue.assigned_to,
      status_text: filteredUpdateFields.status_text !== undefined ? filteredUpdateFields.status_text : existingIssue.status_text,
      open: filteredUpdateFields.open !== undefined ?
        (filteredUpdateFields.open === true || filteredUpdateFields.open === 'true' ? 1 : 0) :
        existingIssue.open
    };

    // Execute update
    const result = statements.updateIssue.run(
      updateData.issue_title,
      updateData.issue_text,
      updateData.created_by,
      updateData.assigned_to,
      updateData.status_text,
      updateData.open,
      issueId
    );

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
    // Check if issue exists - convert _id to number if it's numeric
    const issueId = isNaN(_id) ? _id : parseInt(_id);
    const existingIssue = statements.getIssueById.get(issueId);

    if (!existingIssue) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    // Delete issue
    const result = statements.deleteIssue.run(issueId);

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
