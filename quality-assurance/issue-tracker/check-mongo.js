#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Script to check MongoDB connection and environment variables
console.log('🔍 Checking MongoDB Environment...\n');

// Check environment variables
const envVars = ['MONGODB_URI', 'MONGO_URI', 'DATABASE_URL'];
console.log('📋 Environment Variables:');
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 50)}...`);
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

// Try to connect to MongoDB
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI ||
            process.env.MONGO_URI ||
            process.env.DATABASE_URL ||
            'mongodb://localhost:27017';

console.log(`\n🔌 Attempting connection to: ${uri}`);

let client;
if (uri.includes('mongodb+srv')) {
  // Use SSL options for MongoDB Atlas
  client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
} else {
  // Use default options for local MongoDB
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

client.connect()
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    return client.db().admin().listDatabases();
  })
  .then(result => {
    console.log('📊 Available databases:', result.databases.map(db => db.name));
    client.close();
  })
  .catch(err => {
    console.log('❌ MongoDB connection failed:', err.message);

    // Provide helpful suggestions
    console.log('\n💡 Suggestions:');
    console.log('1. Check if MongoDB is running locally: brew services start mongodb/brew/mongodb-community');
    console.log('2. For FreeCodeCamp/Replit: Check environment variables (MONGO_URI, DATABASE_URL)');
    console.log('3. Use MongoDB Atlas: Create free cluster at https://cloud.mongodb.com');
    console.log('4. Update .env file with correct connection string');
  });
