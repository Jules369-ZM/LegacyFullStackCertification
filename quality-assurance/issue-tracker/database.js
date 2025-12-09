const Database = require('better-sqlite3');

// Create database connection
const db = new Database('./issues.db', { verbose: console.log });

// Create issues table
db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
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

// Prepared statements for better performance
const statements = {
  // Insert new issue
  insertIssue: db.prepare(`
    INSERT INTO issues (project, issue_title, issue_text, created_by, assigned_to, status_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  // Get all issues for a project (with optional filters)
  getIssues: db.prepare(`
    SELECT * FROM issues WHERE project = ? ORDER BY created_on DESC
  `),

  // Get filtered issues
  getFilteredIssues: db.prepare(`
    SELECT * FROM issues WHERE project = ? AND open = ? ORDER BY created_on DESC
  `),

  // Get issues with multiple filters
  getMultiFilteredIssues: db.prepare(`
    SELECT * FROM issues WHERE project = ? AND open = ? AND created_by = ? ORDER BY created_on DESC
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
      open = ?,
      updated_on = CURRENT_TIMESTAMP
    WHERE _id = ?
  `),

  // Delete issue
  deleteIssue: db.prepare(`
    DELETE FROM issues WHERE _id = ?
  `)
};

module.exports = {
  db,
  statements
};
