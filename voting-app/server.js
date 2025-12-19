const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const MongoStore = require('connect-mongo');
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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/votingapp');

// User Schema
const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Poll Schema
const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  options: [{ text: String, votes: { type: Number, default: 0 } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3001/auth/github/callback'
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

// Poll routes
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await Poll.find().populate('createdBy', 'username');
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/polls', ensureAuthenticated, async (req, res) => {
  try {
    const { title, options } = req.body;
    const pollOptions = options.map(option => ({ text: option, votes: 0 }));
    const poll = new Poll({
      title,
      options: pollOptions,
      createdBy: req.user._id
    });
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/polls/:id/vote', ensureAuthenticated, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's polls
app.get('/api/my-polls', ensureAuthenticated, async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user._id }).populate('createdBy', 'username');
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete poll
app.delete('/api/polls/:id', ensureAuthenticated, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own polls' });
    }

    await Poll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Poll deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new option to existing poll
app.post('/api/polls/:id/options', ensureAuthenticated, async (req, res) => {
  try {
    const { optionText } = req.body;
    if (!optionText || !optionText.trim()) {
      return res.status(400).json({ error: 'Option text is required' });
    }

    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // Check if option already exists
    const existingOption = poll.options.find(opt => opt.text.toLowerCase() === optionText.toLowerCase());
    if (existingOption) {
      return res.status(400).json({ error: 'This option already exists' });
    }

    poll.options.push({ text: optionText.trim(), votes: 0 });
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get poll share URL
app.get('/api/polls/:id/share', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    const shareUrl = `${req.protocol}://${req.get('host')}/poll/${poll._id}`;
    res.json({ shareUrl, poll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get poll by ID (for sharing)
app.get('/poll/:id', (req, res) => {
  res.sendFile(__dirname + '/public/poll.html');
});

app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'username');
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user info
app.get('/api/user', ensureAuthenticated, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    displayName: req.user.displayName,
    profileImage: req.user.profileImage
  });
});

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Voting app listening on port ${PORT}`);
});
