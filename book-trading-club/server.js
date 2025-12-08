const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
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
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/booktrading');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String },
  state: { type: String }
});

const User = mongoose.model('User', userSchema);

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  image: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

// Trade Request Schema
const tradeRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  offeredBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const TradeRequest = mongoose.model('TradeRequest', tradeRequestSchema);

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
    const { username, password, city, state } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, city, state });
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
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().populate('owner', 'username city state');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mybooks', ensureAuthenticated, async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', ensureAuthenticated, async (req, res) => {
  try {
    const { title, author, isbn, image } = req.body;
    const book = new Book({
      title,
      author,
      isbn,
      image,
      owner: req.user._id
    });
    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', ensureAuthenticated, async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trade request routes
app.get('/api/trades', ensureAuthenticated, async (req, res) => {
  try {
    const trades = await TradeRequest.find({
      $or: [{ requester: req.user._id }, { owner: req.user._id }]
    }).populate('requester owner requestedBook offeredBook', 'username title author');
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trades', ensureAuthenticated, async (req, res) => {
  try {
    const { requestedBookId, offeredBookId } = req.body;
    const requestedBook = await Book.findById(requestedBookId);
    if (!requestedBook) return res.status(404).json({ error: 'Requested book not found' });

    const offeredBook = await Book.findOne({ _id: offeredBookId, owner: req.user._id });
    if (!offeredBook) return res.status(404).json({ error: 'Offered book not found in your collection' });

    const tradeRequest = new TradeRequest({
      requester: req.user._id,
      owner: requestedBook.owner,
      requestedBook: requestedBookId,
      offeredBook: offeredBookId
    });

    await tradeRequest.save();
    res.json(tradeRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/trades/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const trade = await TradeRequest.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true }
    );

    if (!trade) return res.status(404).json({ error: 'Trade request not found' });

    if (status === 'accepted') {
      // Swap book ownership
      const tempOwner = trade.requestedBook.owner;
      trade.requestedBook.owner = trade.offeredBook.owner;
      trade.offeredBook.owner = tempOwner;

      await trade.requestedBook.save();
      await trade.offeredBook.save();
    }

    res.json(trade);
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

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Book trading club listening on port ${PORT}`);
});
