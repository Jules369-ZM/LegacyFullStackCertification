/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');

// Book Schema & Model
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      // Response: array of book objects [{ _id, title, commentcount }, ...]
      try {
        const books = await Book.find({});
        const result = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })

    .post(async function (req, res) {
      const title = req.body.title;
      // Validate title
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = new Book({ title });
        const saved = await newBook.save();
        res.json({ _id: saved._id, title: saved.title });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })

    .delete(async function (req, res) {
      // Delete all books
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });


  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        // Invalid ObjectId format also means no book exists
        res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      // Validate comment
      if (!comment) {
        return res.send('missing required field comment');
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        book.comments.push(comment);
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        // Invalid ObjectId format also means no book exists
        res.send('no book exists');
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        // Invalid ObjectId format also means no book exists
        res.send('no book exists');
      }
    });

};
