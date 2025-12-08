const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection (for Exercise Tracker)
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.log('MongoDB connection error:', error);
  }
};
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ==================== REQUEST HEADER PARSER MICROSERVICE ====================
app.get('/api/whoami', (req, res) => {
  // Get IP address - comprehensive method for all hosting environments
  let ipaddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                  req.headers['x-real-ip'] ||
                  req.headers['x-client-ip'] ||
                  req.headers['cf-connecting-ip'] ||
                  req.connection?.remoteAddress ||
                  req.socket?.remoteAddress ||
                  req.ip ||
                  '127.0.0.1';

  // Clean up IP address
  if (ipaddress === '::1' || ipaddress === '::ffff:127.0.0.1') {
    ipaddress = '127.0.0.1';
  }
  if (ipaddress.startsWith('::ffff:')) {
    ipaddress = ipaddress.substring(7);
  }

  // Get preferred language from Accept-Language header
  let language = 'en-US'; // default
  if (req.headers['accept-language']) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9")
    const acceptLang = req.headers['accept-language'].split(',')[0];
    if (acceptLang) {
      language = acceptLang.split(';')[0].trim();
    }
  }

  // Get software (User-Agent)
  const software = req.headers['user-agent'] ||
                   req.headers['User-Agent'] ||
                   'Unknown';

  // Ensure all fields are present and valid
  const result = {
    ipaddress: ipaddress || '127.0.0.1',
    language: language || 'en-US',
    software: software || 'Unknown'
  };

  res.json(result);
});

// ==================== EXERCISE TRACKER ====================
// Using in-memory storage for FreeCodeCamp compatibility
const users = [];
const exercises = [];
let userIdCounter = 1;
let exerciseIdCounter = 1;

// Create new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;

  // Check if username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.json({ error: 'Username already taken' });
  }

  // Create new user
  const newUser = {
    username: username,
    _id: userIdCounter.toString()
  };

  users.push(newUser);
  userIdCounter++;

  res.json({
    username: newUser.username,
    _id: newUser._id
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  // Find user
  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Create exercise
  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    _id: exerciseIdCounter.toString(),
    username: user.username,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate,
    userId: _id
  };

  exercises.push(newExercise);
  exerciseIdCounter++;

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date.toDateString(),
    _id: user._id
  });
});

// Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  // Find user
  const user = users.find(u => u._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Get user's exercises
  let userExercises = exercises.filter(ex => ex.userId === _id);

  // Apply date filters
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => ex.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => ex.date <= toDate);
  }

  // Sort by date (most recent first)
  userExercises.sort((a, b) => b.date - a.date);

  // Apply limit
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  // Format log
  const log = userExercises.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date.toDateString()
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log
  });
});

// ==================== TIMESTAMP MICROSERVICE ====================
app.get('/api/:date?', (req, res) => {
  const dateParam = req.params.date;
  let date;

  // If no date provided, use current time
  if (!dateParam) {
    date = new Date();
  } else {
    // Check if it's a unix timestamp (all digits)
    if (/^\d+$/.test(dateParam)) {
      date = new Date(parseInt(dateParam));
    } else {
      date = new Date(dateParam);
    }
  }

  // Check if date is invalid
  if (dateParam && isNaN(date.getTime())) {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// ==================== URL SHORTENER MICROSERVICE ====================
const dns = require('dns');
const url = require('url');

const urlDatabase = {};
let urlCounter = 1;

// Helper function to validate URL with DNS lookup
function validateUrl(originalUrl, callback) {
  // Parse the URL to extract hostname
  let parsedUrl;
  try {
    parsedUrl = url.parse(originalUrl);
  } catch (err) {
    return callback(new Error('Invalid URL format'));
  }

  // Check if hostname exists
  if (!parsedUrl.hostname) {
    return callback(new Error('Invalid URL - no hostname'));
  }

  // Use dns.lookup to verify the domain exists
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return callback(new Error('Invalid URL - domain not found'));
    }
    callback(null, originalUrl);
  });
}

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Basic URL validation
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Validate URL with DNS lookup
  validateUrl(originalUrl, (err, validUrl) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Check if URL already exists
    const existingShortUrl = Object.keys(urlDatabase).find(key => urlDatabase[key] === validUrl);

    if (existingShortUrl) {
      res.json({
        original_url: validUrl,
        short_url: parseInt(existingShortUrl)
      });
    } else {
      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = validUrl;

      res.json({
        original_url: validUrl,
        short_url: shortUrl
      });
    }
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;

  // Validate that short_url is a number
  if (!/^\d+$/.test(shortUrl)) {
    return res.json({ error: 'Wrong format' });
  }

  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// ==================== IMAGE SEARCH ABSTRACTION LAYER ====================
const searchSchema = new mongoose.Schema({
  term: { type: String, required: true },
  when: { type: Date, default: Date.now }
});

const Search = mongoose.model('Search', searchSchema);

// ==================== FILE METADATA MICROSERVICE ====================
const upload = multer({ dest: 'uploads/' });

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.json({ error: 'No file uploaded' });
  }

  const { originalname, mimetype, size } = req.file;

  res.json({
    name: originalname,
    type: mimetype,
    size: size
  });
});

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
