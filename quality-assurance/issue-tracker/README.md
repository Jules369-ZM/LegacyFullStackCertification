# Issue Tracker

This is the boilerplate for the Issue Tracker project. Instructions for building your project can be found at https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/issue-tracker

## Replit Deployment

This project is configured to run on Replit with **SQLite database** (no external setup needed!). Follow these steps:

1. **Import/Fork this Replit**: Make sure all files from this project are included
2. **Install dependencies**: Run `npm install` in the console
3. **Run the application**: Use the "Issue Tracker" workflow or run `npm start`
4. **Run tests**: Execute `npm test` to verify functionality

**That's it!** No database setup required - SQLite creates the database file automatically.

## Environment Variables

Your `.env` file contains:
```
NODE_ENV=test
PORT=3000
# SQLite database file: issues.db (created automatically)
```

## Database

- **Database Type**: SQLite
- **File**: `issues.db` (created automatically in project root)
- **No external setup required**
- **Perfect for Replit deployment**

## API Endpoints

- `POST /api/issues/{project}` - Create an issue
- `GET /api/issues/{project}` - View issues (with optional filtering)
- `PUT /api/issues/{project}` - Update an issue
- `DELETE /api/issues/{project}` - Delete an issue

## Testing

Run `npm test` to execute all functional tests. The application includes 14 comprehensive tests covering all CRUD operations and error handling scenarios.
