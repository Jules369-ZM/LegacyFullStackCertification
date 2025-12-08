# Voting App

A full-stack web application for creating and voting on polls. Built with Node.js, Express, MongoDB, and Passport.js for authentication.

## Features

- User registration and authentication
- Create polls with multiple options
- Vote on polls
- View poll results in real-time
- Session-based authentication

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
   MONGO_URI=mongodb://localhost:27017/votingapp
   SESSION_SECRET=your_session_secret_here
   PORT=3001
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
   Open `http://localhost:3001` in your browser

## API Endpoints

- `GET /` - Main page
- `GET /login` - Login page
- `POST /login` - Login user
- `GET /register` - Registration page
- `POST /register` - Register user
- `GET /logout` - Logout user
- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create new poll (authenticated)
- `POST /api/polls/:id/vote` - Vote on poll (authenticated)

## FreeCodeCamp Certification

This implementation fulfills the requirements for the "Build a Voting App" project in the FreeCodeCamp Back End Development and APIs certification.
