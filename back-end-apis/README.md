# Back End Development and APIs Projects

This directory contains implementations of the Back End Development and APIs certification projects from FreeCodeCamp. All projects are built with Node.js, Express.js, and include proper error handling and validation.

## Projects Implemented

### 1. Timestamp Microservice
- **Routes**: `GET /api/timestamp`, `GET /api/timestamp/:date_string`
- **Description**: Converts dates between Unix timestamp and UTC format
- **Features**:
  - Current timestamp endpoint
  - Date string parsing (Unix timestamps and ISO dates)
  - Error handling for invalid dates

### 2. Request Header Parser Microservice
- **Route**: `GET /api/whoami`
- **Description**: Returns IP address, preferred language, and software information from request headers
- **Features**:
  - Extracts IP address from request
  - Parses Accept-Language header
  - Extracts User-Agent string

### 3. URL Shortener Microservice
- **Routes**: `POST /api/shorturl`, `GET /api/shorturl/:short_url`
- **Description**: Creates short URLs and redirects to original URLs
- **Features**:
  - URL validation
  - In-memory URL storage
  - Duplicate URL handling
  - Redirect functionality

### 4. Exercise Tracker
- **Routes**: `POST /api/users`, `GET /api/users`, `POST /api/users/:_id/exercises`, `GET /api/users/:_id/logs`
- **Description**: Tracks exercise activities with user management
- **Features**:
  - User creation and retrieval
  - Exercise logging with date validation
  - Exercise history with filtering (from/to dates, limit)
  - MongoDB integration with Mongoose

### 5. File Metadata Microservice
- **Route**: `POST /api/fileanalyse`
- **Description**: Uploads files and returns metadata information
- **Features**:
  - File upload handling with Multer
  - Metadata extraction (name, type, size)
  - File storage in uploads directory

## Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for Exercise Tracker
- **Mongoose**: MongoDB object modeling
- **Multer**: File upload middleware
- **CORS**: Cross-origin resource sharing
- **Body-parser**: Request body parsing

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables (for Exercise Tracker):**
   Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/freecodecamp
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Access the application:**
   Open `http://localhost:3000` in your browser

## API Endpoints

### Timestamp Microservice
- `GET /api/timestamp` - Returns current timestamp
- `GET /api/timestamp/:date_string` - Converts date string to Unix/UTC

### Request Header Parser
- `GET /api/whoami` - Returns IP, language, and software info

### URL Shortener
- `POST /api/shorturl` - Creates short URL (body: `{"url": "https://example.com"}`)
- `GET /api/shorturl/:short_url` - Redirects to original URL

### Exercise Tracker
- `POST /api/users` - Create new user (body: `{"username": "user"}`)
- `GET /api/users` - Get all users
- `POST /api/users/:_id/exercises` - Add exercise to user
- `GET /api/users/:_id/logs?[from=][&to=][&limit=]` - Get user's exercise log

### File Metadata
- `POST /api/fileanalyse` - Upload file and get metadata

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Back End Development and APIs certification from FreeCodeCamp.

## Project Status

- ✅ Timestamp Microservice - Completed
- ✅ Request Header Parser Microservice - Completed
- ✅ URL Shortener Microservice - Completed
- ✅ Exercise Tracker - Completed
- ✅ File Metadata Microservice - Completed

**All 5 Back End APIs projects completed!** 🎉
