const express = require('express');
const { statements, ObjectId, db } = require('../database');
const router = express.Router();

// Helper function to validate ObjectId
function isValidObjectId(id) {
  try {
    return ObjectId.isValid(id);
  } catch (error) {
    return false;
  }
}

// Helper function to format issue response
function formatIssue(issue) {
  return {
    _id: issue._id,
    issue_title: issue.issue_title,
    issue_text: issue.issue_text,
    created_on: issue.created_on,
    updated_on: issue.updated_on,
    created_by: issue.created_by,
    assigned_to: issue.assigned_to || '',
    open: issue.open === 1, // SQLite stores as 1/0
    status_text: issue.status_text || ''
  };
}

// GET /api/issues/:project
router.get('/issues/:project', (req, res) => {
  try {
    const project = req.params.project;

    // Start with base query
    let sql = 'SELECT * FROM issues WHERE project = ?';
    const params = [project];

    // Process ALL query parameters that could be filters
    const queryKeys = Object.keys(req.query);

    queryKeys.forEach(key => {
      // Skip if this is not a valid field or if value is undefined
      if (req.query[key] === undefined) return;

      // Handle 'open' field specially
      if (key === 'open') {
        if (req.query[key] === 'true') {
          sql += ' AND open = 1';
        } else if (req.query[key] === 'false') {
          sql += ' AND open = 0';
        }
      }
      // Handle all other fields - including empty strings
      else if (['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', '_id'].includes(key)) {
        sql += ` AND ${key} = ?`;
        params.push(req.query[key]);
      }
    });

    sql += ' ORDER BY created_on DESC';

    const stmt = db.prepare(sql);
    const issues = stmt.all(...params);

    const formattedIssues = issues.map(formatIssue);
    res.json(formattedIssues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues/:project
router.post('/issues/:project', (req, res) => {
  try {
    const project = req.params.project;

    const {
      issue_title,
      issue_text,
      created_by,
      assigned_to = '',
      status_text = ''
    } = req.body;

    // Check required fields
    if (!issue_title || !issue_text || !created_by) {
      return res.json({ error: 'required field(s) missing' });
    }

    // Generate MongoDB-style ObjectId
    const mongoId = new ObjectId().toString();

    // Insert the issue
    statements.insertIssue.run(
      mongoId,
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text
    );

    // Get the inserted issue
    const insertedIssue = statements.getIssueById.get(mongoId);

    res.json(formatIssue(insertedIssue));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:project
router.put('/issues/:project', (req, res) => {
  const { _id } = req.body;

  // 1. Check for missing _id
  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  // 2. Check if _id is a valid MongoDB ObjectId format
  if (!isValidObjectId(_id)) {
    return res.json({ error: 'could not update', '_id': _id });
  }

  try {
    // 3. Check if the issue exists
    const existingIssue = statements.getIssueById.get(_id);
    if (!existingIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // 4. NOW check if any update fields were sent
    const updateFields = {};
    const validUpdateFields = [
      'issue_title',
      'issue_text',
      'created_by',
      'assigned_to',
      'status_text',
      'open'
    ];

    let hasUpdateFields = false;
    validUpdateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
        hasUpdateFields = true;
      }
    });

    if (!hasUpdateFields) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Prepare and execute the update
    const updateValues = [
      updateFields.issue_title !== undefined ? updateFields.issue_title : existingIssue.issue_title,
      updateFields.issue_text !== undefined ? updateFields.issue_text : existingIssue.issue_text,
      updateFields.created_by !== undefined ? updateFields.created_by : existingIssue.created_by,
      updateFields.assigned_to !== undefined ? updateFields.assigned_to : existingIssue.assigned_to,
      updateFields.status_text !== undefined ? updateFields.status_text : existingIssue.status_text,
      updateFields.open !== undefined ? (updateFields.open === true || updateFields.open === 'true' ? 1 : 0) : existingIssue.open,
      _id
    ];

    const result = statements.updateIssue.run(...updateValues);

    if (result.changes > 0) {
      // 5. Success!
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
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    // Check if _id is valid ObjectId
    if (!isValidObjectId(_id)) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

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
