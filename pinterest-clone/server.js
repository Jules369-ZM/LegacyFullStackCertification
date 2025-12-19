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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pinterest');

// User Schema
const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  profileImage: { type: String, default: '' },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Board Schema
const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Board = mongoose.model('Board', boardSchema);

// Pin Schema
const pinSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Pin = mongoose.model('Pin', pinSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pin: { type: mongoose.Schema.Types.ObjectId, ref: 'Pin', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3005/auth/github/callback'
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

app.get('/user/:username', (req, res) => {
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

// API routes
app.get('/api/pins', async (req, res) => {
  try {
    const pins = await Pin.find().populate('creator', 'username').sort({ createdAt: -1 });
    res.json(pins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/boards', ensureAuthenticated, async (req, res) => {
  try {
    const boards = await Board.find({ creator: req.user._id });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boards', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const board = new Board({
      name,
      description,
      isPrivate: isPrivate || false,
      creator: req.user._id
    });
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pins', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, imageUrl, board, tags } = req.body;
    const pin = new Pin({
      title,
      description,
      image: imageUrl,
      creator: req.user._id,
      board: board || null,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    await pin.save();
    res.json(pin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pins/:id', ensureAuthenticated, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ error: 'Pin not found' });

    if (pin.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own pins' });
    }

    await Pin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pin deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pins/:id/like', ensureAuthenticated, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ error: 'Pin not found' });

    const likeIndex = pin.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      pin.likes.splice(likeIndex, 1);
    } else {
      pin.likes.push(req.user._id);
    }

    await pin.save();
    res.json({ likes: pin.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pins/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ pin: req.params.id }).populate('author', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pins/:id/comments', ensureAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = new Comment({
      text,
      author: req.user._id,
      pin: req.params.id
    });
    await comment.save();
    await comment.populate('author', 'username');
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user', ensureAuthenticated, (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    profileImage: req.user.profileImage,
    bio: req.user.bio
  });
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const pins = await Pin.find({ creator: user._id }).populate('creator', 'username').sort({ createdAt: -1 });
    res.json({ user, pins });
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

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Pinterest clone listening on port ${PORT}`);
});
