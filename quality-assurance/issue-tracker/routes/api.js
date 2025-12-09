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

    // Build query based on filters
    let sql = 'SELECT * FROM issues WHERE project = ?';
    const params = [project];

    // Add filters from query parameters
    const validFilters = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];

    validFilters.forEach((field, index) => {
      if (req.query[field] !== undefined) {
        if (field === 'open') {
          const isOpen = req.query[field] === 'true';
          sql += ` AND open = ?`;
          params.push(isOpen ? 1 : 0);
        } else {
          sql += ` AND ${field} = ?`;
          params.push(req.query[field]);
        }
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
  try {
    const { _id, ...updateFields } = req.body;

    // Check for _id
    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    // Check if _id is valid ObjectId
    if (!isValidObjectId(_id)) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // Check if issue exists
    const existingIssue = statements.getIssueById.get(_id);
    if (!existingIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // Get updateable fields
    const validFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
    const fieldsToUpdate = {};

    validFields.forEach(field => {
      if (updateFields[field] !== undefined) {
        if (field === 'open') {
          fieldsToUpdate[field] = updateFields[field] === true || updateFields[field] === 'true' ? 1 : 0;
        } else {
          fieldsToUpdate[field] = updateFields[field];
        }
      }
    });

    // Check if any fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Prepare update values
    const updateValues = [
      fieldsToUpdate.issue_title !== undefined ? fieldsToUpdate.issue_title : existingIssue.issue_title,
      fieldsToUpdate.issue_text !== undefined ? fieldsToUpdate.issue_text : existingIssue.issue_text,
      fieldsToUpdate.created_by !== undefined ? fieldsToUpdate.created_by : existingIssue.created_by,
      fieldsToUpdate.assigned_to !== undefined ? fieldsToUpdate.assigned_to : existingIssue.assigned_to,
      fieldsToUpdate.status_text !== undefined ? fieldsToUpdate.status_text : existingIssue.status_text,
      fieldsToUpdate.open !== undefined ? fieldsToUpdate.open : existingIssue.open,
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
