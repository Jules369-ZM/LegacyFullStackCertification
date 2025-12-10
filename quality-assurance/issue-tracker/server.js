const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const runner = require('./test-runner');
const fccTestingRoutes = require('./routes/fcctesting.js');

// Initialize database
const { connectDB } = require('./database');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to database
connectDB().then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Continuing without database connection for testing purposes');
});

// Routes
app.get('/', (req, res) => {
  res.send('Issue Tracker API');
});

app.use('/api', apiRoutes);

// FCC Testing Routes
fccTestingRoutes(app);

// Start server
const listener = app.listen(port, () => {
  console.log(`Issue Tracker API listening on port ${port}`);

  // Run tests on server start if not in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch(err) {
        console.log('Tests are not valid:');
        console.error(err);
      }
    }, 1500);
  }
});

module.exports = app;
