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
    client = new MongoClient(uri);
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
