const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/personal-library';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [{ type: String }],
  commentcount: { type: Number, default: 0 }
});

const Book = mongoose.model('Book', bookSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Personal Library API');
});

// GET /api/books - Get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().select('_id title commentcount');
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/books - Create a new book
app.post('/api/books', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.json('missing required field title');
    }

    const newBook = new Book({ title });
    const savedBook = await newBook.save();

    res.json({
      _id: savedBook._id,
      title: savedBook.title
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/books - Delete all books
app.delete('/api/books', async (req, res) => {
  try {
    await Book.deleteMany({});
    res.json('complete delete successful');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/books/:id - Get a specific book
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.json('no book exists');
    }

    res.json({
      _id: book._id,
      title: book.title,
      comments: book.comments
    });
  } catch (error) {
    res.json('no book exists');
  }
});

// POST /api/books/:id - Add a comment to a book
app.post('/api/books/:id', async (req, res) => {
  try {
    const { comment } = req.body;
    const bookId = req.params.id;

    if (!comment) {
      return res.json('missing required field comment');
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.json('no book exists');
    }

    book.comments.push(comment);
    book.commentcount = book.comments.length;
    await book.save();

    res.json({
      _id: book._id,
      title: book.title,
      comments: book.comments
    });
  } catch (error) {
    res.json('no book exists');
  }
});

// DELETE /api/books/:id - Delete a specific book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.json('no book exists');
    }

    res.json('delete successful');
  } catch (error) {
    res.json('no book exists');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Personal Library API listening on port ${port}`);
});

module.exports = app;
