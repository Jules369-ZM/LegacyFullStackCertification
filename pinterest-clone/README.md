# Pinterest Clone

A full-stack web application that replicates the core features of Pinterest. Users can link to images, create pins, like and comment on content, browse user walls, and enjoy a Pinterest-style masonry layout.

## Features

- GitHub OAuth authentication
- Link to images (instead of uploading) to create pins
- Delete pins you've created
- Browse all pins in a Pinterest-style masonry grid
- View individual user walls by clicking on usernames
- Like pins and view like counts
- Comment on pins with threaded discussions
- Responsive design with modal pin details
- Broken image detection with placeholder replacement
- Create and manage boards (collections of pins)

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: Passport.js with GitHub OAuth
- **Frontend**: HTML, CSS, JavaScript (vanilla), jQuery, Masonry.js
- **Security**: express-session for sessions
- **Image Handling**: Client-side broken image detection

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up GitHub OAuth:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://localhost:3005/auth/github/callback`

3. **Environment Variables:**
   Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/pinterest
   SESSION_SECRET=your_session_secret_here
   PORT=3005
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

4. **Start MongoDB (optional for basic functionality):**
   For production use, ensure MongoDB is running on your system. The app will work with in-memory sessions for basic testing.

5. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Access the application:**
   Open `http://localhost:3005` in your browser

## API Endpoints

- `GET /` - Main application page
- `GET /user/:username` - User profile/wall page
- `GET /auth/github` - Initiate GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /logout` - Logout user
- `GET /api/pins` - Get all pins
- `POST /api/pins` - Create new pin with image URL (authenticated)
- `DELETE /api/pins/:id` - Delete a pin (authenticated, owner only)
- `POST /api/pins/:id/like` - Like/unlike a pin (authenticated)
- `GET /api/pins/:id/comments` - Get comments for a pin
- `POST /api/pins/:id/comments` - Add comment to pin (authenticated)
- `GET /api/boards` - Get user's boards (authenticated)
- `POST /api/boards` - Create new board (authenticated)
- `GET /api/user` - Get current user info (authenticated)
- `GET /api/users/:username` - Get user's pins for their wall

## Features Overview

### User Management
- Secure registration and login
- Session-based authentication
- Profile management capabilities

### Board System
- Create public or private boards
- Organize pins into themed collections
- Board selection when creating pins

### Pin Management
- Image upload with validation (images only, 5MB max)
- Rich pin creation with titles, descriptions, and tags
- Pinterest-style grid layout with responsive design

### Social Features
- Like/unlike pins with real-time count updates
- Comment system for engagement
- Modal views for detailed pin interaction

### Image Handling
- Secure file upload to `/public/uploads/` directory
- File type validation (images only)
- Automatic filename generation for security

## File Structure

```
pinterest-clone/
├── server.js
├── package.json
├── .env
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── styles.css
│   ├── script.js
│   └── uploads/  # Uploaded images stored here
└── README.md
```

## FreeCodeCamp Certification

This implementation fulfills the requirements for the "Build a Pinterest Clone" project in the FreeCodeCamp Back End Development and APIs certification.
