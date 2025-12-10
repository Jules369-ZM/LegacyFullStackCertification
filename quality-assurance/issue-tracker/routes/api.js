const express = require('express');
const { connectDB, generateId } = require('../database');
const router = express.Router();

// Helper function to validate ID (simple string validation)
function isValidId(id) {
  return typeof id === 'string' && id.length > 0;
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

    // Build WHERE clause
    let whereConditions = ['project = $1'];
    let queryParams = [project];
    let paramIndex = 2;

    // Process query parameters for filtering
    Object.keys(req.query).forEach(key => {
      if (req.query[key] !== undefined) {
        if (key === 'open') {
          // Handle boolean conversion for open field
          whereConditions.push(`open = $${paramIndex}`);
          queryParams.push(req.query[key] === 'true');
        } else {
          // Handle other fields including _id
          whereConditions.push(`${key} = $${paramIndex}`);
          queryParams.push(req.query[key]);
        }
        paramIndex++;
      }
    });

    const whereClause = whereConditions.join(' AND ');
    const query = `SELECT * FROM issues WHERE ${whereClause} ORDER BY created_on DESC`;

    const result = await db.query(query, queryParams);
    const formattedIssues = result.rows.map(formatIssue);
    res.json(formattedIssues);
  } catch (error) {
    console.error('GET issues error:', error);
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

    // Generate a unique ID
    const issueId = generateId();

    const query = `
      INSERT INTO issues (_id, project, issue_title, issue_text, created_by, assigned_to, status_text, open)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [issueId, project, issue_title, issue_text, created_by, assigned_to, status_text, true];

    const result = await db.query(query, values);
    const insertedIssue = result.rows[0];

    res.json(formatIssue(insertedIssue));
  } catch (error) {
    console.error('POST issue error:', error);
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

    // 2. Check if _id is valid
    if (!isValidId(_id)) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // 3. Check if the issue exists
    const checkQuery = 'SELECT * FROM issues WHERE _id = $1';
    const checkResult = await db.query(checkQuery, [_id]);
    if (checkResult.rows.length === 0) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    // 4. Check if any update fields were sent
    const validUpdateFields = [
      'issue_title',
      'issue_text',
      'created_by',
      'assigned_to',
      'status_text',
      'open'
    ];

    let hasUpdateFields = false;
    let setParts = [];
    let values = [_id];
    let paramIndex = 2;

    validUpdateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'open') {
          setParts.push(`${field} = $${paramIndex}`);
          values.push(req.body[field] === true || req.body[field] === 'true');
        } else {
          setParts.push(`${field} = $${paramIndex}`);
          values.push(req.body[field]);
        }
        hasUpdateFields = true;
        paramIndex++;
      }
    });

    if (!hasUpdateFields) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    // Add updated_on timestamp
    setParts.push(`updated_on = CURRENT_TIMESTAMP`);

    // Update the issue
    const updateQuery = `UPDATE issues SET ${setParts.join(', ')} WHERE _id = $1`;
    const result = await db.query(updateQuery, values);

    if (result.rowCount > 0) {
      res.json({ result: 'successfully updated', '_id': _id });
    } else {
      res.json({ error: 'could not update', '_id': _id });
    }
  } catch (error) {
    console.error('PUT issue error:', error);
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

    // Check if _id is valid
    if (!isValidId(_id)) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    // Check if issue exists
    const checkQuery = 'SELECT * FROM issues WHERE _id = $1';
    const checkResult = await db.query(checkQuery, [_id]);
    if (checkResult.rows.length === 0) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    // Delete the issue
    const deleteQuery = 'DELETE FROM issues WHERE _id = $1';
    const result = await db.query(deleteQuery, [_id]);

    if (result.rowCount > 0) {
      res.json({ result: 'successfully deleted', '_id': _id });
    } else {
      res.json({ error: 'could not delete', '_id': _id });
    }
  } catch (error) {
    console.error('DELETE issue error:', error);
    res.json({ error: 'could not delete', '_id': _id });
  }
});

module.exports = router;
