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

async function testConnection() {
  let client;

  // Strategy 1: Try with minimal SSL options
  try {
    console.log('🔌 Trying MongoDB connection with minimal SSL...');
    const options1 = {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
    };

    client = new MongoClient(uri, options1);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    const result = await client.db().admin().listDatabases();
    console.log('📊 Available databases:', result.databases.map(db => db.name));
    client.close();
    return;
  } catch (error1) {
    console.log('❌ Minimal SSL connection failed:', error1.message);

    // Strategy 2: Try with different SSL settings
    try {
      console.log('🔌 Trying MongoDB connection with alternative SSL...');
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
      console.log('✅ Successfully connected to MongoDB with alternative SSL!');
      const result = await client.db().admin().listDatabases();
      console.log('📊 Available databases:', result.databases.map(db => db.name));
      client.close();
      return;
    } catch (error2) {
      console.log('❌ Alternative SSL connection failed:', error2.message);

      // Strategy 3: Try localhost
      try {
        console.log('🔌 Trying localhost MongoDB...');
        const options3 = {
          serverSelectionTimeoutMS: 5000,
        };

        client = new MongoClient('mongodb://localhost:27017', options3);
        await client.connect();
        console.log('✅ Successfully connected to local MongoDB!');
        const result = await client.db().admin().listDatabases();
        console.log('📊 Available databases:', result.databases.map(db => db.name));
        client.close();
        return;
      } catch (error3) {
        console.log('❌ Localhost connection failed:', error3.message);
        console.error('❌ All MongoDB connection strategies failed');

        // Provide helpful suggestions
        console.log('\n💡 Suggestions:');
        console.log('1. Check if MongoDB is running locally: brew services start mongodb/brew/mongodb-community');
        console.log('2. For FreeCodeCamp/Replit: Contact FreeCodeCamp support about MongoDB access');
        console.log('3. Use MongoDB Atlas: Create free cluster at https://cloud.mongodb.com');
        console.log('4. Try a different MongoDB hosting service');
      }
    }
  }
}

testConnection();
