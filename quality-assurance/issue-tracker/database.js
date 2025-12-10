const { Pool } = require('pg');

// PostgreSQL connection using Replit's DATABASE_URL
const connectionString = process.env.DATABASE_URL ||
                        process.env.MONGODB_URI ||
                        process.env.MONGO_URI;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Replit PostgreSQL
});

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    try {
      // Test the connection
      const client = await pool.connect();
      console.log('✅ Connected to PostgreSQL successfully');

      // Create issues table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS issues (
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

      client.release();
      isConnected = true;
      return pool;
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      throw new Error('Unable to connect to PostgreSQL database');
    }
  }
  return pool;
}

// Helper function to generate unique IDs (similar to MongoDB ObjectId)
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

module.exports = {
  connectDB,
  generateId
};
