# Quality Assurance Projects

This directory contains implementations of the Quality Assurance certification projects from FreeCodeCamp. All projects focus on API development, testing, and quality assurance practices.

## Projects Implemented

### 1. Metric-Imperial Converter (`metric-imperial-converter/`)
- **Description**: Unit conversion API for metric and imperial measurements
- **Technology**: Node.js, Express, HTML/CSS/JavaScript
- **Features**:
  - Convert between gallons/liters, pounds/kilograms, miles/kilometers
  - Web interface with real-time conversion
  - Input validation and error handling
  - Comprehensive test suite with Mocha/Chai

### 2. Issue Tracker (`issue-tracker/`)
- **Description**: Issue management API with full CRUD operations
- **Database**: MongoDB with Mongoose
- **Features**:
  - Create, read, update, delete issues
  - Filter issues by project, status, assignee
  - RESTful API design
  - Proper error handling and validation

### 3. Personal Library (`personal-library/`)
- **Description**: Book library management API
- **Database**: MongoDB with Mongoose
- **Features**:
  - Add books with titles
  - Add comments to books
  - Retrieve book lists and details
  - Delete books and comments
  - RESTful API with proper responses

### 4. Sudoku Solver (`sudoku-solver/`)
- **Description**: Sudoku puzzle solver and validator API
- **Technology**: Node.js, Express
- **Features**:
  - Solve complete Sudoku puzzles
  - Validate moves with conflict detection
  - Backtracking algorithm implementation
  - Coordinate-based validation (A1-I9 format)

### 5. American British Translator (`american-british-translator/`)
- **Description**: Text translation service between American and British English
- **Technology**: Node.js, Express
- **Features**:
  - Spelling differences (color/colour, center/centre)
  - Common term translations (apartment/flat, elevator/lift)
  - Bidirectional translation
  - Input validation and error handling

## Technologies Used

- **Node.js & Express**: Primary backend framework for all APIs
- **MongoDB & Mongoose**: Database solutions for data persistence
- **Mocha & Chai**: Testing framework for quality assurance
- **HTML/CSS/JavaScript**: Frontend interfaces where applicable
- **RESTful APIs**: Standard HTTP methods and status codes

## Prerequisites

- Node.js installed
- MongoDB running (for database projects)
- npm for package management

## Setup Instructions

### For All Projects:
1. Navigate to project directory: `cd <project-name>`
2. Install dependencies: `npm install`
3. For database projects, ensure MongoDB is running
4. Start server: `npm start` or `npm run dev` for development

### Environment Variables:
- `PORT`: Server port (default: 3000)
- `MONGO_URI`: MongoDB connection string (for database projects)

## Testing

Each project includes comprehensive tests using Mocha and Chai:
```bash
npm test
```

## API Documentation

### Metric-Imperial Converter
- `GET /api/convert?input=<value>` - Convert units

### Issue Tracker
- `GET /api/issues/:project` - Get project issues
- `POST /api/issues/:project` - Create new issue
- `PUT /api/issues/:project` - Update issue
- `DELETE /api/issues/:project` - Delete issue

### Personal Library
- `GET /api/books` - Get all books
- `POST /api/books` - Add new book
- `DELETE /api/books` - Delete all books
- `GET /api/books/:id` - Get specific book
- `POST /api/books/:id` - Add comment to book
- `DELETE /api/books/:id` - Delete specific book

### Sudoku Solver
- `POST /api/solve` - Solve Sudoku puzzle
- `POST /api/check` - Validate Sudoku move

### American British Translator
- `POST /api/translate` - Translate text between American/British English

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Quality Assurance certification from FreeCodeCamp, covering:

- API development and testing
- Database integration and CRUD operations
- Algorithm implementation
- Input validation and error handling
- Test-driven development practices

## Project Status

- ✅ Metric-Imperial Converter - Completed
- ✅ Issue Tracker - Completed
- ✅ Personal Library - Completed
- ✅ Sudoku Solver - Completed
- ✅ American British Translator - Completed
