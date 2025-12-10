// database.js - SQLite with MongoDB-style ObjectIds
const Database = require('better-sqlite3');
const { ObjectId } = require('mongodb'); // Only for ObjectId generation

// Create database connection
const db = new Database('./issues.db', { verbose: console.log });

// Drop and recreate table to ensure correct schema
db.exec(`
  DROP TABLE IF EXISTS issues;
  DROP TRIGGER IF EXISTS update_issues_timestamp;
`);

db.exec(`
  CREATE TABLE issues (
    _id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    issue_title TEXT NOT NULL,
    issue_text TEXT NOT NULL,
    created_by TEXT NOT NULL,
    assigned_to TEXT DEFAULT '',
    status_text TEXT DEFAULT '',
    open INTEGER DEFAULT 1,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create a trigger to update updated_on automatically
db.exec(`
  CREATE TRIGGER update_issues_timestamp
  AFTER UPDATE ON issues
  BEGIN
    UPDATE issues SET updated_on = CURRENT_TIMESTAMP WHERE _id = NEW._id;
  END;
`);

// Prepared statements for better performance
const statements = {
  // Insert new issue with MongoDB-style ObjectId
  insertIssue: db.prepare(`
    INSERT INTO issues (_id, project, issue_title, issue_text, created_by, assigned_to, status_text, open)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `),

  // Get issue by ID
  getIssueById: db.prepare(`
    SELECT * FROM issues WHERE _id = ?
  `),

  // Update issue
  updateIssue: db.prepare(`
    UPDATE issues SET
      issue_title = ?,
      issue_text = ?,
      created_by = ?,
      assigned_to = ?,
      status_text = ?,
      open = ?
    WHERE _id = ?
  `),

  // Delete issue
  deleteIssue: db.prepare(`
    DELETE FROM issues WHERE _id = ?
  `),

  // Get issues by project with filters
  getIssuesByProject: db.prepare(`
    SELECT * FROM issues WHERE project = ? ORDER BY created_on DESC
  `)
};

module.exports = {
  db,
  statements,
  ObjectId
};
