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
    // Try multiple connection strategies for Replit compatibility

    // Strategy 1: Try with minimal SSL options
    try {
      console.log('Trying MongoDB connection with minimal SSL...');
      const options1 = {
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
      };

      client = new MongoClient(uri, options1);
      await client.connect();
      db = client.db(dbName);
      console.log('✅ Connected to MongoDB successfully');
      return db;
    } catch (error1) {
      console.log('❌ Minimal SSL connection failed:', error1.message);

    // Strategy 2: Try with different SSL settings
    try {
      console.log('Trying MongoDB connection with different SSL settings...');
      const options2 = {
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        tlsInsecure: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
      };

      client = new MongoClient(uri, options2);
      await client.connect();
      db = client.db(dbName);
      console.log('✅ Connected to MongoDB with alternative SSL');
      return db;
    } catch (error2) {
      console.log('❌ Alternative SSL connection failed:', error2.message);

        // Strategy 3: Try localhost as last resort (for FreeCodeCamp)
        try {
          console.log('Trying localhost MongoDB...');
          const options3 = {
            serverSelectionTimeoutMS: 5000,
          };

          client = new MongoClient('mongodb://localhost:27017', options3);
          await client.connect();
          db = client.db('issue-tracker');
          console.log('✅ Connected to local MongoDB');
          return db;
        } catch (error3) {
          console.log('❌ Localhost connection failed:', error3.message);
          console.error('All MongoDB connection strategies failed');
          throw new Error('Unable to connect to MongoDB. Please check your connection string and network.');
        }
      }
    }
  }
  return db;
}

module.exports = {
  connectDB,
  ObjectId
};
