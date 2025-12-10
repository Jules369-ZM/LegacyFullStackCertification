const express = require('express');
const { connectDB, ObjectId } = require('../database');
const router = express.Router();

// Helper function to validate ObjectId
function isValidObjectId(id) {
  return ObjectId.isValid(id) && typeof id === 'string' && id.length === 24;
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
    open: issue.open,
    status_text: issue.status_text || ''
  };
}

// GET /api/issues/:project
router.get('/issues/:project', async (req, res) => {
  try {
    const db = await connectDB();
    const project = req.params.project;

    // Build query object
    const query = { project };

    // Process query parameters for filtering
    Object.keys(req.query).forEach(key => {
      if (req.query[key] !== undefined) {
        if (key === 'open') {
          // Handle boolean conversion for open field
          query[key] = req.query[key] === 'true';
        } else {
          // Handle other fields including _id
          query[key] = req.query[key];
        }
      }
    });

    const issues = await db.collection('issues')
      .find(query)
      .sort({ created_on: -1 })
      .toArray();

    const formattedIssues = issues.map(formatIssue);
    res.json(formattedIssues);
  } catch (error) {
    // Return empty array if database error
    res.json([]);
  }
});

// POST /api/issues/:project
router.post('/issues/:project', async (req, res) => {
  try {
    const db = await connectDB();
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
    // Return error object if database operation fails
    res.json({ error: 'could not create issue' });
  }
});

// PUT /api/issues/:project
router.put('/issues/:project', async (req, res) => {
  try {
    const db = await connectDB();
    const { _id } = req.body;

    // 1. Check for missing _id
    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    // 2. Check if _id is a valid MongoDB ObjectId format
    if (!isValidObjectId(_id)) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    const objectId = new ObjectId(_id);

    // 3. Check if the issue exists
    const existingIssue = await db.collection('issues').findOne({ _id: objectId });
    if (!existingIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // 4. Check if any update fields were sent
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
        if (field === 'open') {
          updateFields[field] = req.body[field] === true || req.body[field] === 'true';
        } else {
          updateFields[field] = req.body[field];
        }
        hasUpdateFields = true;
      }
    });

    if (!hasUpdateFields) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Add updated_on timestamp
    updateFields.updated_on = new Date();

    // Update the issue
    const result = await db.collection('issues').updateOne(
      { _id: objectId },
      { $set: updateFields }
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
    const db = await connectDB();
    const { _id } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    // Check if _id is valid ObjectId
    if (!isValidObjectId(_id)) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    const objectId = new ObjectId(_id);

    // Check if issue exists
    const existingIssue = await db.collection('issues').findOne({ _id: objectId });
    if (!existingIssue) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    // Delete the issue
    const result = await db.collection('issues').deleteOne({ _id: objectId });

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
