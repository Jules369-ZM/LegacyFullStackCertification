# Information Security

This directory contains implementations of the Information Security certification projects from FreeCodeCamp. All projects focus on security concepts, authentication, encryption, network security, and secure application development.

## Projects Implemented

### 1. Stock Price Checker (`stock-price-checker/`)
- **Description**: Secure stock price API with rate limiting
- **Technology**: Node.js, Express, Helmet, Rate Limiting
- **Features**:
  - JWT-based authentication (simulated)
  - Rate limiting to prevent abuse
  - Input validation and sanitization
  - Stock price caching to reduce external API calls
  - Secure headers with Helmet

### 2. Anonymous Message Board (`anonymous-message-board/`)
- **Description**: Secure forum application with user authentication
- **Database**: MongoDB with Mongoose
- **Features**:
  - User registration and authentication with bcrypt
  - JWT token-based authorization
  - Thread and reply management with password protection
  - Content reporting system
  - Session management and security headers

### 3. Port Scanner (`port-scanner/`)
- **Description**: Network security tool for port scanning
- **Technology**: Python, Socket programming, Threading
- **Features**:
  - Concurrent port scanning with threading
  - Hostname resolution and IP validation
  - Customizable port ranges and timeouts
  - Progress tracking and results reporting
  - Command-line interface with argument parsing

### 4. SHA-1 Password Cracker (`sha-1-password-cracker/`)
- **Description**: Educational password cracking demonstration
- **Technology**: Python, Hashlib, Itertools
- **Features**:
  - Multiple cracking methods (brute force, dictionary, hybrid)
  - SHA-1 and MD5 hash support
  - Progress tracking and performance metrics
  - Security warnings and ethical disclaimers
  - Wordlist support for dictionary attacks

### 5. Secure Real Time Multiplayer Game (`secure-real-time-multiplayer-game/`)
- **Description**: Secure multiplayer tic-tac-toe game with real-time communication
- **Technology**: Node.js, Socket.io, JWT, bcrypt
- **Features**:
  - User authentication with password hashing
  - JWT token-based WebSocket authentication
  - Real-time game state synchronization
  - Rate limiting and security headers
  - Input sanitization and validation

## Technologies Used

- **Node.js & Express**: Backend API development
- **MongoDB & Mongoose**: Database operations
- **Socket.io**: Real-time communication
- **Python**: Security tools and algorithms
- **JWT & bcrypt**: Authentication and encryption
- **Helmet & Rate Limiting**: Security middleware
- **Threading & Async**: Concurrent operations

## Prerequisites

- Node.js installed (for web projects)
- Python 3.x installed (for security tools)
- MongoDB running (for database projects)
- npm for package management

## Setup Instructions

### For Node.js Projects:
1. Navigate to project directory: `cd <project-name>`
2. Install dependencies: `npm install`
3. Set environment variables (JWT_SECRET, MONGO_URI, etc.)
4. Start server: `npm start`

### For Python Projects:
1. Ensure Python 3.x is installed
2. Run directly: `python <script_name>.py [arguments]`
3. For port scanner: `python port_scanner.py <host> [options]`
4. For password cracker: `python sha1_cracker.py <hash> [options]`

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- User registration and login systems

### Network Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure headers with Helmet
- CORS configuration

### Application Security
- SQL injection prevention (MongoDB)
- XSS protection through input sanitization
- CSRF protection considerations
- Secure WebSocket connections

## API Documentation

### Stock Price Checker
- `GET /api/stock-prices?stock=<symbol>` - Get stock price
- `POST /api/stock-prices` - Like a stock (requires auth)
- `GET /api/stock-prices/compare?stock1=X&stock2=Y` - Compare stocks

### Anonymous Message Board
- `POST /api/threads/:board` - Create thread
- `GET /api/threads/:board` - Get threads
- `DELETE /api/threads/:board` - Delete thread
- `PUT /api/threads/:board` - Report thread
- `POST /api/replies/:board` - Create reply
- `GET /api/replies/:board?thread_id=X` - Get replies
- `DELETE /api/replies/:board` - Delete reply
- `PUT /api/replies/:board` - Report reply

### Secure Real Time Multiplayer Game
- `POST /api/register` - User registration
- `POST /api/login` - User login
- WebSocket events: `join-lobby`, `create-game`, `join-game`, `make-move`, etc.

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Information Security certification from FreeCodeCamp, covering:

- Secure API development
- Authentication and authorization
- Network security concepts
- Cryptography fundamentals
- Secure real-time applications
- Input validation and sanitization

## Ethical Considerations

⚠️ **Important**: Some tools in this collection (like the port scanner and password cracker) are for educational purposes only. They demonstrate security concepts and should never be used for malicious activities. Always ensure you have explicit permission before scanning networks or attempting to crack passwords.

## Project Status

- ✅ Stock Price Checker - Completed
- ✅ Anonymous Message Board - Completed
- ✅ Port Scanner - Completed
- ✅ SHA-1 Password Cracker - Completed
- ✅ Secure Real Time Multiplayer Game - Completed
