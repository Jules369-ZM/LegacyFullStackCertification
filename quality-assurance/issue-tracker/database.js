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
    // Try different connection approaches for Replit compatibility
    let connectionOptions = {};

    if (uri.includes('mongodb+srv')) {
      // For MongoDB Atlas, try minimal SSL options
      connectionOptions = {
        tls: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      };
    }

    try {
      client = new MongoClient(uri, connectionOptions);
      await client.connect();
      db = client.db(dbName);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection failed, trying alternative approach:', error.message);

      // Try without SSL for local MongoDB or alternative setups
      try {
        client = new MongoClient(uri.replace('mongodb+srv', 'mongodb'), {
          tls: false,
          serverSelectionTimeoutMS: 5000,
        });
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to MongoDB (without SSL)');
      } catch (secondError) {
        console.error('All MongoDB connection attempts failed');
        throw secondError;
      }
    }
  }
  return db;
}

module.exports = {
  connectDB,
  ObjectId
};
