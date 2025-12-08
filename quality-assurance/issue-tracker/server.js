const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/issue-tracker';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Issue Schema
const issueSchema = new mongoose.Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  open: { type: Boolean, default: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now }
});

const Issue = mongoose.model('Issue', issueSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Issue Tracker API');
});

// GET /api/issues/:project
app.get('/api/issues/:project', async (req, res) => {
  try {
    const project = req.params.project;
    const query = { project };

    // Add filters from query parameters
    if (req.query.open !== undefined) {
      query.open = req.query.open === 'true';
    }
    if (req.query.assigned_to) {
      query.assigned_to = req.query.assigned_to;
    }
    if (req.query.created_by) {
      query.created_by = req.query.created_by;
    }

    const issues = await Issue.find(query).select('-__v');
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/issues/:project
app.post('/api/issues/:project', async (req, res) => {
  try {
    const project = req.params.project;
    const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

    if (!issue_title || !issue_text || !created_by) {
      return res.json({ error: 'required field(s) missing' });
    }

    const newIssue = new Issue({
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to: assigned_to || '',
      status_text: status_text || ''
    });

    const savedIssue = await newIssue.save();
    res.json({
      _id: savedIssue._id,
      issue_title: savedIssue.issue_title,
      issue_text: savedIssue.issue_text,
      created_by: savedIssue.created_by,
      assigned_to: savedIssue.assigned_to,
      status_text: savedIssue.status_text,
      open: savedIssue.open,
      created_on: savedIssue.created_on,
      updated_on: savedIssue.updated_on
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/issues/:project
app.put('/api/issues/:project', async (req, res) => {
  try {
    const project = req.params.project;
    const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && open === undefined) {
      return res.json({ error: 'no update field(s) sent', '_id': _id });
    }

    const updateData = {};
    if (issue_title !== undefined) updateData.issue_title = issue_title;
    if (issue_text !== undefined) updateData.issue_text = issue_text;
    if (created_by !== undefined) updateData.created_by = created_by;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (status_text !== undefined) updateData.status_text = status_text;
    if (open !== undefined) updateData.open = open === 'true' || open === true;
    updateData.updated_on = new Date();

    const updatedIssue = await Issue.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updatedIssue) {
      return res.json({ error: 'could not update', '_id': _id });
    }

    res.json({ result: 'successfully updated', '_id': _id });
  } catch (error) {
    res.json({ error: 'could not update', '_id': req.body._id });
  }
});

// DELETE /api/issues/:project
app.delete('/api/issues/:project', async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.json({ error: 'missing _id' });
    }

    const deletedIssue = await Issue.findByIdAndDelete(_id);

    if (!deletedIssue) {
      return res.json({ error: 'could not delete', '_id': _id });
    }

    res.json({ result: 'successfully deleted', '_id': _id });
  } catch (error) {
    res.json({ error: 'could not delete', '_id': req.body._id });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Issue Tracker API listening on port ${port}`);
});

module.exports = app;
