const express = require('express');
const { connectDB, generateId, dbType } = require('../database');
const router = express.Router();

// Helper function to validate ID
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

    if (dbType === 'postgresql') {
      // PostgreSQL implementation
      let whereConditions = ['project = $1'];
      let queryParams = [project];
      let paramIndex = 2;

      // Process query parameters for filtering
      Object.keys(req.query).forEach(key => {
        if (req.query[key] !== undefined) {
          if (key === 'open') {
            whereConditions.push(`open = $${paramIndex}`);
            queryParams.push(req.query[key] === 'true');
          } else {
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
    } else if (dbType === 'mongodb') {
      // MongoDB implementation
      const query = { project };

      // Process query parameters for filtering
      Object.keys(req.query).forEach(key => {
        if (req.query[key] !== undefined) {
          if (key === 'open') {
            query[key] = req.query[key] === 'true';
          } else if (key === '_id') {
            query[key] = require('mongodb').ObjectId(req.query[key]);
          } else {
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
    } else {
      // Memory database implementation
      const allIssues = Array.from(db.issues.values());
      let filteredIssues = allIssues.filter(issue => issue.project === project);

      // Apply filters
      Object.keys(req.query).forEach(key => {
        if (req.query[key] !== undefined) {
          if (key === 'open') {
            filteredIssues = filteredIssues.filter(issue => issue.open === (req.query[key] === 'true'));
          } else {
            filteredIssues = filteredIssues.filter(issue => issue[key] === req.query[key]);
          }
        }
      });

      // Sort by created_on descending
      filteredIssues.sort((a, b) => new Date(b.created_on) - new Date(a.created_on));

      const formattedIssues = filteredIssues.map(formatIssue);
      res.json(formattedIssues);
    }
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

    if (dbType === 'postgresql') {
      // PostgreSQL implementation
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
    } else if (dbType === 'mongodb') {
      // MongoDB implementation
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
    } else {
      // Memory database implementation
      const now = new Date();
      const issueId = generateId();
      const issue = {
        _id: issueId,
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

      db.issues.set(issueId, issue);
      res.json(formatIssue(issue));
    }
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

    if (dbType === 'postgresql') {
      // PostgreSQL implementation
      const checkQuery = 'SELECT * FROM issues WHERE _id = $1';
      const checkResult = await db.query(checkQuery, [_id]);
      if (checkResult.rows.length === 0) {
        return res.json({ error: 'could not update', '_id': _id });
      }

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

      setParts.push(`updated_on = CURRENT_TIMESTAMP`);
      const updateQuery = `UPDATE issues SET ${setParts.join(', ')} WHERE _id = $1`;
      const result = await db.query(updateQuery, values);

      if (result.rowCount > 0) {
        res.json({ result: 'successfully updated', '_id': _id });
      } else {
        res.json({ error: 'could not update', '_id': _id });
      }
    } else if (dbType === 'mongodb') {
      // MongoDB implementation
      const { ObjectId } = require('mongodb');

      if (!ObjectId.isValid(_id)) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      const objectId = new ObjectId(_id);
      const existingIssue = await db.collection('issues').findOne({ _id: objectId });
      if (!existingIssue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

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

      updateFields.updated_on = new Date();
      const result = await db.collection('issues').updateOne(
        { _id: objectId },
        { $set: updateFields }
      );

      if (result.modifiedCount > 0) {
        res.json({ result: 'successfully updated', '_id': _id });
      } else {
        res.json({ error: 'could not update', '_id': _id });
      }
    } else {
      // Memory database implementation
      const issue = db.issues.get(_id);
      if (!issue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

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
            issue[field] = req.body[field] === true || req.body[field] === 'true';
          } else {
            issue[field] = req.body[field];
          }
          hasUpdateFields = true;
        }
      });

      if (!hasUpdateFields) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      issue.updated_on = new Date();
      res.json({ result: 'successfully updated', '_id': _id });
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

    if (dbType === 'postgresql') {
      // PostgreSQL implementation
      const checkQuery = 'SELECT * FROM issues WHERE _id = $1';
      const checkResult = await db.query(checkQuery, [_id]);
      if (checkResult.rows.length === 0) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      const deleteQuery = 'DELETE FROM issues WHERE _id = $1';
      const result = await db.query(deleteQuery, [_id]);

      if (result.rowCount > 0) {
        res.json({ result: 'successfully deleted', '_id': _id });
      } else {
        res.json({ error: 'could not delete', '_id': _id });
      }
    } else if (dbType === 'mongodb') {
      // MongoDB implementation
      const { ObjectId } = require('mongodb');

      if (!ObjectId.isValid(_id)) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      const objectId = new ObjectId(_id);
      const existingIssue = await db.collection('issues').findOne({ _id: objectId });
      if (!existingIssue) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      const result = await db.collection('issues').deleteOne({ _id: objectId });

      if (result.deletedCount > 0) {
        res.json({ result: 'successfully deleted', '_id': _id });
      } else {
        res.json({ error: 'could not delete', '_id': _id });
      }
    } else {
      // Memory database implementation
      const issue = db.issues.get(_id);
      if (!issue) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      db.issues.delete(_id);
      res.json({ result: 'successfully deleted', '_id': _id });
    }
  } catch (error) {
    console.error('DELETE issue error:', error);
    res.json({ error: 'could not delete', '_id': _id });
  }
});

module.exports = router;
