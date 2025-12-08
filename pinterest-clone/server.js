const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pinterest');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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

app.post('/api/pins', ensureAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { title, description, board, tags } = req.body;
    const pin = new Pin({
      title,
      description,
      image: '/uploads/' + req.file.filename,
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
