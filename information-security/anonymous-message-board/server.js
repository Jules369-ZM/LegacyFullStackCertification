const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/anonymous-message-board';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({optionsSuccessStatus: 200}));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Board Schema
const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  created_on: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Board = mongoose.model('Board', boardSchema);

// Thread Schema
const threadSchema = new mongoose.Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: { type: String, required: true },
  replies: [{
    text: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    delete_password: { type: String, required: true },
    reported: { type: Boolean, default: false }
  }]
});

const Thread = mongoose.model('Thread', threadSchema);

// Passport Local Strategy
passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      // Update last login
      user.last_login = new Date();
      await user.save();

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Anonymous Message Board API');
});

// POST /api/threads/:board - Create new thread
app.post('/api/threads/:board', async (req, res) => {
  try {
    const { text, delete_password } = req.body;
    const board = req.params.board;

    if (!text || !delete_password) {
      return res.json({ error: 'Required fields missing' });
    }

    // Check if board exists, create if not
    let boardDoc = await Board.findOne({ name: board });
    if (!boardDoc) {
      boardDoc = new Board({
        name: board,
        description: `${board} board`,
        created_by: req.user ? req.user._id : null
      });
      await boardDoc.save();
    }

    const newThread = new Thread({
      board,
      text,
      delete_password
    });

    const savedThread = await newThread.save();
    res.json({
      _id: savedThread._id,
      text: savedThread.text,
      created_on: savedThread.created_on,
      bumped_on: savedThread.bumped_on
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/threads/:board - Get threads for a board
app.get('/api/threads/:board', async (req, res) => {
  try {
    const board = req.params.board;

    const threads = await Thread.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .select('_id text created_on bumped_on replies')
      .lean();

    // Format replies for each thread
    const formattedThreads = threads.map(thread => ({
      _id: thread._id,
      text: thread.text,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on,
      replycount: thread.replies.length,
      replies: thread.replies.slice(-3).map(reply => ({
        _id: reply._id,
        text: reply.text,
        created_on: reply.created_on
      }))
    }));

    res.json(formattedThreads);

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/threads/:board - Delete a thread
app.delete('/api/threads/:board', async (req, res) => {
  try {
    const { thread_id, delete_password } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) {
      return res.json({ error: 'Thread not found' });
    }

    if (thread.delete_password !== delete_password) {
      return res.json({ error: 'Incorrect password' });
    }

    await Thread.findByIdAndDelete(thread_id);
    res.json({ result: 'Thread successfully deleted' });

  } catch (error) {
    res.json({ error: 'Could not delete thread' });
  }
});

// PUT /api/threads/:board - Report a thread
app.put('/api/threads/:board', async (req, res) => {
  try {
    const { thread_id } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) {
      return res.json({ error: 'Thread not found' });
    }

    thread.reported = true;
    await thread.save();

    res.json({ result: 'Thread reported' });

  } catch (error) {
    res.json({ error: 'Could not report thread' });
  }
});

// POST /api/replies/:board - Create new reply
app.post('/api/replies/:board', async (req, res) => {
  try {
    const { thread_id, text, delete_password } = req.body;
    const board = req.params.board;

    if (!thread_id || !text || !delete_password) {
      return res.json({ error: 'Required fields missing' });
    }

    const thread = await Thread.findById(thread_id);
    if (!thread) {
      return res.json({ error: 'Thread not found' });
    }

    thread.replies.push({
      text,
      delete_password
    });

    thread.bumped_on = new Date();
    await thread.save();

    res.json({
      _id: thread._id,
      text: thread.text,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/replies/:board - Get all replies for a thread
app.get('/api/replies/:board', async (req, res) => {
  try {
    const { thread_id } = req.query;

    const thread = await Thread.findById(thread_id)
      .select('_id text created_on bumped_on replies')
      .lean();

    if (!thread) {
      return res.json({ error: 'Thread not found' });
    }

    res.json({
      _id: thread._id,
      text: thread.text,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on,
      replies: thread.replies.map(reply => ({
        _id: reply._id,
        text: reply.text,
        created_on: reply.created_on
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/replies/:board - Delete a reply
app.delete('/api/replies/:board', async (req, res) => {
  try {
    const { thread_id, reply_id, delete_password } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) {
      return res.json({ error: 'Thread not found' });
    }

    const reply = thread.replies.id(reply_id);
    if (!reply) {
      return res.json({ error: 'Reply not found' });
    }

    if (reply.delete_password !== delete_password) {
      return res.json({ error: 'Incorrect password' });
    }

    reply.remove();
    await thread.save();

    res.json({ result: 'Reply successfully deleted' });

  } catch (error) {
    res.json({ error: 'Could not delete reply' });
  }
});

// PUT /api/replies/:board - Report a reply
app.put('/api/replies/:board', async (req, res) => {
  try {
    const { thread_id, reply_id } = req.body;

    const thread = await Thread.findById(thread_id);
    if (!thread) {
      return res.json({ error: 'Thread not found' });
    }

    const reply = thread.replies.id(reply_id);
    if (!reply) {
      return res.json({ error: 'Reply not found' });
    }

    reply.reported = true;
    await thread.save();

    res.json({ result: 'Reply reported' });

  } catch (error) {
    res.json({ error: 'Could not report reply' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Anonymous Message Board API listening on port ${port}`);
});

module.exports = app;
