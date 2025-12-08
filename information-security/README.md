# Information Security and Quality Assurance Projects

This directory contains implementations of the Information Security and Quality Assurance certification projects from FreeCodeCamp. These projects focus on secure API development, input validation, testing, and quality assurance practices.

## Projects Implemented

### 1. Metric-Imperial Converter (`metric-imperial-converter/`)
- **Description**: API service for converting between metric and imperial units
- **Features**:
  - Unit conversions for volume (L ↔ gal), distance (km ↔ mi), and weight (kg ↔ lbs)
  - Input validation and error handling
  - Security middleware (Helmet, rate limiting)
  - RESTful API with GET and POST endpoints
  - Frontend interface for testing conversions

### 2. Issue Tracker (`issue-tracker/`)
- **Description**: Issue tracking system with CRUD operations
- **Features**: Coming soon...

### 3. Personal Library (`personal-library/`)
- **Description**: Book library management system
- **Features**: Coming soon...

### 4. Stock Price Checker (`stock-price-checker/`)
- **Description**: Stock price lookup and comparison service
- **Features**: Coming soon...

### 5. Anonymous Message Board (`anonymous-message-board/`)
- **Description**: Anonymous messaging system with moderation
- **Features**: Coming soon...

## Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: MongoDB object modeling
- **Helmet**: Security middleware
- **express-rate-limit**: Rate limiting protection
- **CORS**: Cross-origin resource sharing
- **Joi**: Input validation (future projects)
- **Mocha/Chai**: Testing framework (future projects)

## Installation and Setup

Each project is self-contained with its own `package.json`. To run a project:

```bash
cd project-directory
npm install
npm start
```

For projects requiring MongoDB, ensure you have MongoDB running locally or set up the appropriate environment variables.

## Security Features

All projects implement security best practices:
- **Helmet**: Sets various HTTP headers for security
- **Rate Limiting**: Prevents abuse with request limits
- **Input Validation**: Proper validation and sanitization
- **CORS**: Controlled cross-origin access
- **Error Handling**: Secure error responses without information leakage

## API Endpoints

### Metric-Imperial Converter
- `GET /api/convert?input=<value><unit>` - Convert units via query parameter
- `POST /api/convert` - Convert units via JSON body

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Information Security and Quality Assurance certification from FreeCodeCamp.

## Project Status

- ✅ Metric-Imperial Converter - Completed
- 🔄 Issue Tracker - In Progress
- ⏳ Personal Library - Planned
- ⏳ Stock Price Checker - Planned
- ⏳ Anonymous Message Board - Planned

**Information Security projects: 1/5 completed** 🛡️
