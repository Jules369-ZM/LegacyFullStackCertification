// database-mongodb.js
const { MongoClient } = require('mongodb');

// MongoDB connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'issueTrackerDB';

let client;
let db;

async function connectDB() {
  try {
    client = await MongoClient.connect(url);
    db = client.db(dbName);
    console.log('MongoDB connected successfully');

    // Create indexes
    await db.collection('issues').createIndex({ project: 1 });
    await db.collection('issues').createIndex({ _id: 1 });

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Close connection
async function closeDB() {
  if (client) {
    await client.close();
  }
}

// Get the database instance
function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

module.exports = {
  connectDB,
  closeDB,
  getDB
};
