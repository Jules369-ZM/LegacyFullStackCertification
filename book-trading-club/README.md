# Book Trading Club

A full-stack web application for managing personal book collections and trading books with other users. Users can add books to their collection, browse others' books, and request/accept book trades.

## Features

- User registration and authentication
- Add books to personal collection
- Browse all available books for trade
- Request book trades with other users
- Accept or reject trade requests
- Automatic book ownership transfer upon accepted trades
- View trade history and pending requests

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: Passport.js with local strategy
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Security**: bcryptjs for password hashing, express-session for sessions

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/booktrading
   SESSION_SECRET=your_session_secret_here
   PORT=3004
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system.

4. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Access the application:**
   Open `http://localhost:3004` in your browser

## API Endpoints

- `GET /` - Main application page
- `GET /login` - Login page
- `POST /login` - Login user
- `GET /register` - Registration page
- `POST /register` - Register user
- `GET /logout` - Logout user
- `GET /api/books` - Get all books available for trade
- `GET /api/mybooks` - Get current user's books (authenticated)
- `POST /api/books` - Add new book to collection (authenticated)
- `DELETE /api/books/:id` - Remove book from collection (authenticated)
- `GET /api/trades` - Get user's trade requests (authenticated)
- `POST /api/trades` - Request a book trade (authenticated)
- `PUT /api/trades/:id` - Accept/reject trade request (authenticated)

## Trade System

The trade system allows users to:
- Request trades by offering one of their books for another user's book
- Accept or reject incoming trade requests
- Automatic ownership transfer when trades are accepted
- View all pending and completed trades

## FreeCodeCamp Certification

This implementation fulfills the requirements for the "Manage a Book Trading Club" project in the FreeCodeCamp Back End Development and APIs certification.
