'use strict';

const { Project } = require('../models.js');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      let projectName = req.params.project;
      try {
        let projectDoc = await Project.findOne({ name: projectName });
        if (!projectDoc) return res.json([]);

        let filters = req.query;
        let issues = projectDoc.issues;

        // Apply filters from query string
        Object.keys(filters).forEach(key => {
          issues = issues.filter(issue => {
            if (key === '_id') return issue._id.toString() === filters[key];
            if (key === 'open') return issue.open.toString() === filters[key];
            return issue[key] === filters[key];
          });
        });

        return res.json(issues);
      } catch (err) {
        return res.json({ error: err.message });
      }
    })

    .post(async function (req, res) {
      let projectName = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        let projectDoc = await Project.findOne({ name: projectName });
        if (!projectDoc) {
          projectDoc = new Project({ name: projectName, issues: [] });
        }

        const newIssue = {
          project_id: projectName,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          open: true,
          created_on: new Date(),
          updated_on: new Date()
        };

        projectDoc.issues.push(newIssue);
        await projectDoc.save();

        const savedIssue = projectDoc.issues[projectDoc.issues.length - 1];
        return res.json(savedIssue);
      } catch (err) {
        return res.json({ error: err.message });
      }
    })

    .put(async function (req, res) {
      let projectName = req.params.project;
      const { _id, ...updateFields } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Remove undefined/empty fields
      const fieldsToUpdate = {};
      Object.keys(updateFields).forEach(key => {
        if (updateFields[key] !== undefined && updateFields[key] !== '') {
          fieldsToUpdate[key] = updateFields[key];
        }
      });

      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      try {
        let projectDoc = await Project.findOne({ name: projectName });
        if (!projectDoc) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        const issue = projectDoc.issues.id(_id);
        if (!issue) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        Object.keys(fieldsToUpdate).forEach(key => {
          issue[key] = fieldsToUpdate[key];
        });
        issue.updated_on = new Date();

        await projectDoc.save();
        return res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
        return res.json({ error: 'could not update', '_id': _id });
      }
    })

    .delete(async function (req, res) {
      let projectName = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        let projectDoc = await Project.findOne({ name: projectName });
        if (!projectDoc) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        const issue = projectDoc.issues.id(_id);
        if (!issue) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        issue.deleteOne();
        await projectDoc.save();
        return res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
    });

};
