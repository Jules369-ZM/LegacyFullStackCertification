const { MongoClient, ObjectId } = require('mongodb');

// Check for various MongoDB environment variables that FreeCodeCamp might use
const uri = process.env.MONGODB_URI ||
            process.env.MONGO_URI ||
            process.env.DATABASE_URL ||
            'mongodb://localhost:27017';
const dbName = 'issue-tracker';

let client;
let db;

async function connectDB() {
  if (!client) {
    // Configure MongoDB client with SSL options for Replit compatibility
    const options = {
      // SSL/TLS options for MongoDB Atlas
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      // Connection timeout
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    // Only add SSL options for MongoDB Atlas (mongodb+srv) connections
    if (uri.includes('mongodb+srv')) {
      client = new MongoClient(uri, options);
    } else {
      client = new MongoClient(uri);
    }

    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  }
  return db;
}

module.exports = {
  connectDB,
  ObjectId
};
