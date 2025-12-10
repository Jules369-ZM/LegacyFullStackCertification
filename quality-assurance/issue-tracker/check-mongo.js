#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Script to check PostgreSQL connection and environment variables
console.log('🔍 Checking PostgreSQL Database Environment...\n');

// Check environment variables
const envVars = ['DATABASE_URL', 'MONGODB_URI', 'MONGO_URI'];
console.log('📋 Environment Variables:');
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 50)}...`);
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

// Choose database type based on environment variables
const hasPostgreSQL = !!process.env.DATABASE_URL;
const hasMongoDB = !!(process.env.MONGODB_URI || process.env.MONGO_URI);

let dbType;
let connectionString;

if (hasPostgreSQL) {
  dbType = 'PostgreSQL';
  connectionString = process.env.DATABASE_URL;
} else if (hasMongoDB) {
  dbType = 'MongoDB';
  connectionString = process.env.MONGODB_URI || process.env.MONGO_URI;
} else {
  dbType = 'None';
}

console.log(`\n🔌 Attempting connection to: ${dbType}`);
console.log(`📍 Connection string: ${connectionString ? connectionString.substring(0, 50) + '...' : 'undefined'}`);

async function testConnection() {
  if (dbType === 'None') {
    console.error('❌ No database connection string found in environment variables');
    console.log('\n💡 Suggestions:');
    console.log('1. Set DATABASE_URL for PostgreSQL (Replit)');
    console.log('2. Set MONGODB_URI for MongoDB (local development)');
    console.log('3. Check your .env file');
    return;
  }

  if (dbType === 'PostgreSQL') {
    // Test PostgreSQL connection
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool.connect();
      console.log('✅ Successfully connected to PostgreSQL!');

      const result = await client.query('SELECT version()');
      console.log('📊 PostgreSQL version:', result.rows[0].version.split(' ')[1]);

      // Check if issues table exists
      const tableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'issues'
        )
      `);

      if (tableResult.rows[0].exists) {
        console.log('📋 Issues table exists');
        const countResult = await client.query('SELECT COUNT(*) FROM issues');
        console.log(`📊 Total issues: ${countResult.rows[0].count}`);
      } else {
        console.log('📋 Issues table does not exist (will be created on first API call)');
      }

      client.release();
      pool.end();
      console.log('✅ Database connection test completed successfully!');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      console.log('\n💡 Suggestions:');
      console.log('1. Check your DATABASE_URL format');
      console.log('2. For Replit: PostgreSQL should be available automatically');
      console.log('3. Verify SSL settings');
    }
  } else if (dbType === 'MongoDB') {
    // Test MongoDB connection
    const { MongoClient } = require('mongodb');

    try {
      const client = new MongoClient(connectionString);
      await client.connect();
      console.log('✅ Successfully connected to MongoDB!');

      const db = client.db();
      const collections = await db.collections();
      console.log('📊 Available collections:', collections.map(c => c.collectionName));

      // Check if issues collection exists
      const issuesCollection = collections.find(c => c.collectionName === 'issues');
      if (issuesCollection) {
        const count = await issuesCollection.countDocuments();
        console.log(`📊 Total issues: ${count}`);
      } else {
        console.log('📋 Issues collection does not exist (will be created on first API call)');
      }

      client.close();
      console.log('✅ Database connection test completed successfully!');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('\n💡 Suggestions:');
      console.log('1. Check your MONGODB_URI format');
      console.log('2. Ensure MongoDB is running locally');
      console.log('3. Verify network connectivity to MongoDB Atlas');
    }
  }
}

testConnection();
