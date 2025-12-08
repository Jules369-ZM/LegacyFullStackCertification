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
const urlDatabase = {};
let urlCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Basic URL validation
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists
  const existingShortUrl = Object.keys(urlDatabase).find(key => urlDatabase[key] === originalUrl);

  if (existingShortUrl) {
    res.json({
      original_url: originalUrl,
      short_url: parseInt(existingShortUrl)
    });
  } else {
    const shortUrl = urlCounter++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// ==================== EXERCISE TRACKER ====================
const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);

// ==================== IMAGE SEARCH ABSTRACTION LAYER ====================
const searchSchema = new mongoose.Schema({
  term: { type: String, required: true },
  when: { type: Date, default: Date.now }
});

const Search = mongoose.model('Search', searchSchema);

// Image search endpoint
app.get('/api/imagesearch/:searchterm', async (req, res) => {
  try {
    const searchterm = req.params.searchterm;
    const offset = parseInt(req.query.offset) || 10;

    // Save search to DB
    const search = new Search({ term: searchterm });
    await search.save();

    // Bing Image Search API
    const apiKey = process.env.BING_API_KEY;
    if (!apiKey) {
      return res.json({ error: 'Bing API key not configured' });
    }

    const response = await axios.get(`https://api.bing.microsoft.com/v7.0/images/search`, {
      params: {
        q: searchterm,
        count: offset,
        mkt: 'en-US'
      },
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      }
    });

    const results = response.data.value.map(img => ({
      url: img.contentUrl,
      snippet: img.name,
      thumbnail: img.thumbnailUrl,
      context: img.hostPageUrl
    }));

    res.json(results);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Latest searches endpoint
app.get('/api/latest/imagesearch', async (req, res) => {
  try {
    const searches = await Search.find({}, 'term when -_id').sort({ when: -1 }).limit(10);
    res.json(searches);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    const savedUser = await user.save();
    res.json({
      username: savedUser.username,
      _id: savedUser._id
    });
  } catch (error) {
    if (error.code === 11000) {
      res.json({ error: 'Username already taken' });
    } else {
      res.json({ error: error.message });
    }
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    const user = await User.findById(_id);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    const exercise = new Exercise({
      username: user.username,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    });

    const savedExercise = await exercise.save();

    res.json({
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
      _id: user._id
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Get user's exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    let query = { username: user.username };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    let exercises = Exercise.find(query).select('description duration date');

    if (limit) {
      exercises = exercises.limit(parseInt(limit));
    }

    const exerciseList = await exercises;
    const log = exerciseList.map(ex => ({
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
  } catch (error) {
    res.json({ error: error.message });
  }
});

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
