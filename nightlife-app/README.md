# Nightlife Coordination App

A full-stack web application for finding and coordinating nightlife activities. Users can search for bars and restaurants using the Yelp API, view venue details and ratings, and RSVP to coordinate social gatherings.

## Features

- **GitHub OAuth Authentication** - Secure login with GitHub accounts
- **Yelp API Integration** - Real-time search for bars and nightlife venues
- **Location-Based Search** - Find venues in any city or location
- **RSVP Functionality** - Add/remove yourself from venues ("I'm Going" feature)
- **Social Coordination** - See how many people are going to each venue
- **Search Persistence** - Authenticated users don't need to search again after login
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI/UX** - Clean, attractive interface with smooth interactions

## User Stories Implemented

✅ **As an unauthenticated user, you can view all bars in your area.**
- Users can search for bars in any location without logging in
- Real-time results from Yelp API with ratings and reviews

✅ **As an authenticated user, you can add yourself to a bar to indicate you are going there tonight.**
- GitHub OAuth authentication
- One-click RSVP with visual feedback

✅ **As an authenticated user, you can remove yourself from a bar if you no longer want to go there.**
- Toggle functionality - click again to remove RSVP
- Real-time count updates

✅ **As an unauthenticated user, when you login you should not have to search again.**
- Search location is saved to user profile
- Seamless experience between authenticated and unauthenticated states

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: Passport.js with GitHub OAuth
- **API Integration**: Yelp Fusion API for venue data
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Security**: express-session for sessions
- **HTTP Client**: Axios for API calls

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up GitHub OAuth:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:3002/auth/github/callback`

3. **Get Yelp API Key:**
   - Sign up for Yelp Fusion API at https://www.yelp.com/developers
   - Create an app and get your API key

4. **Environment Variables:**
   Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/nightlifeapp
   SESSION_SECRET=your_session_secret_here
   PORT=3002
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   YELP_API_KEY=your_yelp_api_key
   ```

5. **Start MongoDB:**
   Make sure MongoDB is running on your system.

6. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

7. **Access the application:**
   Open `http://localhost:3002` in your browser

## API Endpoints

- `GET /` - Main application page
- `GET /auth/github` - Initiate GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /logout` - Logout user
- `GET /api/bars?location=...` - Get bars for location (Yelp API integration)
- `POST /api/bars/:id/rsvp` - RSVP to/from a bar (authenticated)
- `GET /api/user` - Get current user info (authenticated)

## Architecture

```
nightlife-app/
├── server.js           # Express server with GitHub auth & Yelp API integration
├── public/
│   ├── index.html      # Main nightlife coordination interface
│   ├── login.html      # GitHub OAuth login page
│   ├── script.js       # Frontend logic with search & RSVP functionality
│   └── styles.css      # Modern responsive styling
├── package.json        # Dependencies & scripts
├── .env               # Environment configuration
└── README.md          # Complete documentation
```

## Key Features

### Yelp API Integration
- Fetches real bar and nightlife venue data
- Includes ratings, review counts, images, and location details
- Searches by city, state, or zip code
- Fallback to mock data if API key is not configured

### GitHub OAuth
- Secure authentication without password management
- Automatic user profile creation
- Session persistence across browser sessions

### RSVP System
- Add/remove yourself from venues
- Real-time count updates
- Visual feedback with button state changes
- Persistent across sessions

### Search Persistence
- User's last search location is saved
- Seamless experience when logging in/out
- No need to re-search after authentication

## FreeCodeCamp Certification

This implementation fulfills all requirements for the "Build a Nightlife Coordination App" project in the FreeCodeCamp Back End Development and APIs certification.

**Source Code Link:** https://github.com/Jules369-ZM/LegacyFullStackCertification
