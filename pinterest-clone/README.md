# Pinterest Clone

A full-stack web application that replicates the core features of Pinterest. Users can create boards, upload pins, like and comment on content, and browse an image-based social platform.

## Features

- User registration and authentication
- Create and manage boards (collections of pins)
- Upload images and create pins with titles and descriptions
- Browse all pins in a Pinterest-style masonry grid
- Like pins and view like counts
- Comment on pins with threaded discussions
- Responsive design with modal pin details
- Image upload with file validation (5MB limit)

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer for image handling
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
   MONGO_URI=mongodb://localhost:27017/pinterest
   SESSION_SECRET=your_session_secret_here
   PORT=3005
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
   Open `http://localhost:3005` in your browser

## API Endpoints

- `GET /` - Main application page
- `GET /login` - Login page
- `POST /login` - Login user
- `GET /register` - Registration page
- `POST /register` - Register user
- `GET /logout` - Logout user
- `GET /api/pins` - Get all pins
- `POST /api/pins` - Create new pin with image upload (authenticated)
- `POST /api/pins/:id/like` - Like/unlike a pin (authenticated)
- `GET /api/pins/:id/comments` - Get comments for a pin
- `POST /api/pins/:id/comments` - Add comment to pin (authenticated)
- `GET /api/boards` - Get user's boards (authenticated)
- `POST /api/boards` - Create new board (authenticated)
- `GET /api/user` - Get current user info (authenticated)

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
