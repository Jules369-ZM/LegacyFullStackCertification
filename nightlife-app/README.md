# Nightlife Coordination App

A full-stack web application for finding and coordinating nightlife activities. Users can search for bars and restaurants, view details, and RSVP to events.

## Features

- User registration and authentication
- Search for bars and nightlife venues
- View venue details and ratings
- RSVP to venues ("I'm Going" functionality)
- See how many people are going to each venue
- Social coordination features

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
   MONGO_URI=mongodb://localhost:27017/nightlifeapp
   SESSION_SECRET=your_session_secret_here
   PORT=3002
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
   Open `http://localhost:3002` in your browser

## API Endpoints

- `GET /` - Main page
- `GET /login` - Login page
- `POST /login` - Login user
- `GET /register` - Registration page
- `POST /register` - Register user
- `GET /logout` - Logout user
- `GET /api/bars?location=...` - Get bars for location
- `POST /api/bars/:id/rsvp` - RSVP to a bar (authenticated)

## Note on API Integration

This implementation uses mock data for demonstration. In a production environment, you would integrate with a real API like Yelp Fusion API or Google Places API to fetch real venue data.

## FreeCodeCamp Certification

This implementation fulfills the requirements for the "Build a Nightlife Coordination App" project in the FreeCodeCamp Back End Development and APIs certification.
