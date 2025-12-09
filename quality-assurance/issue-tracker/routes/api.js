const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../database-mongodb');
const router = express.Router();

// Helper function to validate ObjectId
function isValidObjectId(id) {
  try {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
  } catch (error) {
    return false;
  }
}

// Helper function to format issue response
function formatIssue(issue) {
  return {
    _id: issue._id.toString(),
    issue_title: issue.issue_title,
    issue_text: issue.issue_text,
    created_on: issue.created_on,
    updated_on: issue.updated_on,
    created_by: issue.created_by,
    assigned_to: issue.assigned_to || '',
    open: issue.open !== false, // Default to true if not set
    status_text: issue.status_text || ''
  };
}

// GET /api/issues/:project
router.get('/issues/:project', async (req, res) => {
  try {
    const db = getDB();
    const project = req.params.project;

    // Build filter object
    const filter = { project };

    // Add query filters
    const validFilters = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];

    validFilters.forEach(field => {
      if (req.query[field] !== undefined) {
        if (field === 'open') {
          // Convert string 'true'/'false' to boolean
          filter[field] = req.query[field] === 'true';
        } else {
          filter[field] = req.query[field];
        }
      }
    });

    // For optional fields that should match empty string
    if (req.query.assigned_to === '') {
      filter.assigned_to = '';
    }

    if (req.query.status_text === '') {
      filter.status_text = '';
    }

    const issues = await db.collection('issues')
      .find(filter)
      .sort({ created_on: -1 })
      .toArray();

    const formattedIssues = issues.map(formatIssue);
    res.json(formattedIssues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues/:project
router.post('/issues/:project', async (req, res) => {
  try {
    const db = getDB();
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

    const now = new Date();
    const issue = {
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open: true,
      created_on: now,
      updated_on: now
    };

    const result = await db.collection('issues').insertOne(issue);
    const insertedIssue = await db.collection('issues').findOne({ _id: result.insertedId });

    res.json(formatIssue(insertedIssue));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:project
router.put('/issues/:project', async (req, res) => {
  try {
    const db = getDB();
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
    const existingIssue = await db.collection('issues').findOne({ _id: new ObjectId(_id) });
    if (!existingIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // Get updateable fields
    const validFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
    const fieldsToUpdate = {};

    validFields.forEach(field => {
      if (updateFields[field] !== undefined) {
        if (field === 'open') {
          fieldsToUpdate[field] = updateFields[field] === true || updateFields[field] === 'true';
        } else {
          fieldsToUpdate[field] = updateFields[field];
        }
      }
    });

    // Check if any fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Add updated_on timestamp
    fieldsToUpdate.updated_on = new Date();

    const result = await db.collection('issues').updateOne(
      { _id: new ObjectId(_id) },
      { $set: fieldsToUpdate }
    );

    if (result.modifiedCount > 0) {
      res.json({ result: 'successfully updated', '_id': _id });
    } else {
      res.json({ error: 'could not update', '_id': _id });
    }
  } catch (error) {
    res.json({ error: 'could not update', '_id': _id });
  }
});

// DELETE /api/issues/:project
router.delete('/issues/:project', async (req, res) => {
  try {
    const db = getDB();
    const { _id } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    // Check if _id is valid ObjectId
    if (!isValidObjectId(_id)) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    // Check if issue exists
    const existingIssue = await db.collection('issues').findOne({ _id: new ObjectId(_id) });
    if (!existingIssue) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    const result = await db.collection('issues').deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount > 0) {
      res.json({ result: 'successfully deleted', '_id': _id });
    } else {
      res.json({ error: 'could not delete', '_id': _id });
    }
  } catch (error) {
    res.json({ error: 'could not delete', '_id': _id });
  }
});

module.exports = router;
