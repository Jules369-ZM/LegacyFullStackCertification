const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
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
  saveUninitialized: false
  // store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // Uncomment when MongoDB is available
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nightlifeapp');

// User Schema
const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  profileImage: { type: String, default: '' },
  lastSearchLocation: { type: String, default: 'New York, NY' },
  createdAt: { type: Date, default: Date.now }
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

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3002/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = new User({
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        profileImage: profile.photos[0].value
      });
      await user.save();
    }
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
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Function to fetch bars from Yelp API
async function fetchBarsFromYelp(location) {
  try {
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      console.warn('Yelp API key not found, using mock data');
      return mockBars;
    }

    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: {
        term: 'bars',
        location: location,
        limit: 20,
        sort_by: 'rating'
      }
    });

    return response.data.businesses.map(business => ({
      id: business.id,
      name: business.name,
      image_url: business.image_url || 'https://via.placeholder.com/300x200?text=No+Image',
      url: business.url,
      location: {
        city: business.location.city,
        state: business.location.state
      },
      rating: business.rating,
      review_count: business.review_count
    }));
  } catch (error) {
    console.error('Error fetching from Yelp API:', error.message);
    console.log('Using mock data instead');
    return mockBars;
  }
}

// API routes
app.get('/api/bars', async (req, res) => {
  try {
    const location = req.query.location || 'New York, NY';

    // Save location to user session if authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { lastSearchLocation: location });
    }

    const bars = await fetchBarsFromYelp(location);

    // Get going counts from database for each bar
    for (let bar of bars) {
      const dbBar = await Bar.findOne({ yelpId: bar.id }).populate('going');
      if (dbBar) {
        bar.going = dbBar.going.length;
      } else {
        bar.going = 0;
      }
    }

    res.json(bars);
  } catch (error) {
    console.error('Error in /api/bars:', error);
    res.status(500).json({ error: 'Failed to fetch bars' });
  }
});

app.post('/api/bars/:id/rsvp', ensureAuthenticated, async (req, res) => {
  try {
    const barId = req.params.id;
    let bar = await Bar.findOne({ yelpId: barId });

    if (!bar) {
      // Create bar entry - we'll get the name from Yelp API or use a placeholder
      // For now, create with minimal info and update later if needed
      bar = new Bar({
        yelpId: barId,
        name: 'Bar', // Placeholder - could be updated when we fetch from Yelp
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
    res.json({ going: bar.going.length, isGoing: bar.going.includes(req.user._id) });
  } catch (err) {
    console.error('RSVP error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user', ensureAuthenticated, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    profileImage: req.user.profileImage,
    displayName: req.user.displayName,
    lastSearchLocation: req.user.lastSearchLocation
  });
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
