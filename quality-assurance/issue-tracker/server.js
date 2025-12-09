const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const runner = require('./test-runner');

// Initialize MongoDB database
const { connectDB } = require('./database-mongodb');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Issue Tracker API');
});

app.use('/api', apiRoutes);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    console.log('MongoDB database initialized');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    console.log('Continuing without database connection...');
  })
  .finally(() => {
    // Always start the server and run tests, even if MongoDB fails
    const listener = app.listen(port, () => {
      console.log(`Issue Tracker API listening on port ${port}`);
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          console.log('Tests are not valid:');
          console.error(e);
        }
      }, 1500);
    });

    module.exports = app;
  });
