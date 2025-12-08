const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nightlifeapp');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Bar Schema (for RSVPs)
const barSchema = new mongoose.Schema({
  yelpId: { type: String, required: true, unique: true },
  name: String,
  image_url: String,
  url: String,
  going: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Bar = mongoose.model('Bar', barSchema);

// Mock bar data (in real app, this would come from Yelp API)
const mockBars = [
  {
    id: 'bar1',
    name: 'The Local Pub',
    image_url: 'https://via.placeholder.com/300x200?text=The+Local+Pub',
    url: 'https://example.com/bar1',
    location: { city: 'New York', state: 'NY' },
    rating: 4.5
  },
  {
    id: 'bar2',
    name: 'Downtown Lounge',
    image_url: 'https://via.placeholder.com/300x200?text=Downtown+Lounge',
    url: 'https://example.com/bar2',
    location: { city: 'New York', state: 'NY' },
    rating: 4.2
  }
];

// Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: 'Incorrect username.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Authentication routes
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: false
}));

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.redirect('/register');
  }
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// API routes
app.get('/api/bars', async (req, res) => {
  const location = req.query.location || 'New York, NY';
  // In real app, call Yelp API
  // For now, return mock data
  const bars = mockBars.map(bar => ({
    ...bar,
    going: 0 // Will be updated with actual going count
  }));

  // Get going counts from database
  for (let bar of bars) {
    const dbBar = await Bar.findOne({ yelpId: bar.id }).populate('going');
    if (dbBar) {
      bar.going = dbBar.going.length;
    }
  }

  res.json(bars);
});

app.post('/api/bars/:id/rsvp', ensureAuthenticated, async (req, res) => {
  try {
    const barId = req.params.id;
    let bar = await Bar.findOne({ yelpId: barId });

    if (!bar) {
      // Create bar entry
      bar = new Bar({
        yelpId: barId,
        name: mockBars.find(b => b.id === barId)?.name || 'Unknown Bar',
        going: [req.user._id]
      });
    } else {
      // Check if user is already going
      const isGoing = bar.going.includes(req.user._id);
      if (isGoing) {
        bar.going.pull(req.user._id);
      } else {
        bar.going.push(req.user._id);
      }
    }

    await bar.save();
    res.json({ going: bar.going.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Nightlife app listening on port ${PORT}`);
});
