const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');

// Initialize database
const { db } = require('./database');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('SQLite database initialized');

// Routes
app.get('/', (req, res) => {
  res.send('Issue Tracker API');
});

app.use('/api', apiRoutes);

// Start server
app.listen(port, () => {
  console.log(`Issue Tracker API listening on port ${port}`);
});

module.exports = app;
