// Choose database based on available environment variables
const hasPostgreSQL = !!process.env.DATABASE_URL;
const hasMongoDB = !!(process.env.MONGODB_URI || process.env.MONGO_URI);

let dbType;
let dbConnection;

if (hasPostgreSQL) {
  // Use PostgreSQL on Replit
  dbType = 'postgresql';
  const { Pool } = require('pg');
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Replit PostgreSQL
  });

  dbConnection = pool;
} else if (hasMongoDB) {
  // Use MongoDB locally (fallback for development)
  dbType = 'mongodb';
  const { MongoClient, ObjectId } = require('mongodb');
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const dbName = 'issue-tracker';

  const client = new MongoClient(uri);
  dbConnection = { client, dbName };
} else {
  throw new Error('No database configuration found. Set DATABASE_URL (PostgreSQL) or MONGODB_URI (MongoDB)');
}

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    if (dbType === 'postgresql') {
      // PostgreSQL connection (Replit)
      try {
        const client = await dbConnection.connect();
        console.log('✅ Connected to PostgreSQL successfully');

        // Drop and recreate issues table with correct schema
        try {
          await client.query('DROP TABLE IF EXISTS issues');
          console.log('Dropped existing issues table (schema migration)');
        } catch (dropError) {
          console.log('No existing table to drop');
        }

        await client.query(`
          CREATE TABLE issues (
            _id TEXT PRIMARY KEY,
            project TEXT NOT NULL,
            issue_title TEXT NOT NULL,
            issue_text TEXT NOT NULL,
            created_by TEXT NOT NULL,
            assigned_to TEXT DEFAULT '',
            status_text TEXT DEFAULT '',
            open BOOLEAN DEFAULT TRUE,
            created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        console.log('Created issues table with correct schema');
        client.release();
        isConnected = true;
        return dbConnection;
      } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        throw new Error('Unable to connect to PostgreSQL database');
      }
    } else if (dbType === 'mongodb') {
      // MongoDB connection (local development)
      try {
        await dbConnection.client.connect();
        console.log('✅ Connected to MongoDB successfully');
        isConnected = true;
        return dbConnection.client.db(dbConnection.dbName);
      } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw new Error('Unable to connect to MongoDB database');
      }
    }
  }

  return dbType === 'postgresql' ? dbConnection : dbConnection.client.db(dbConnection.dbName);
}

// Helper function to generate unique IDs
function generateId() {
  if (dbType === 'mongodb') {
    // Use MongoDB ObjectId for MongoDB
    return new (require('mongodb').ObjectId)().toString();
  } else {
    // Use string IDs for PostgreSQL
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = {
  connectDB,
  generateId,
  dbType
};
