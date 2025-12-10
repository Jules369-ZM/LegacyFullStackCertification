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

// Try to connect to PostgreSQL
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL ||
                        process.env.MONGODB_URI ||
                        process.env.MONGO_URI;

console.log(`\n🔌 Attempting connection to: ${connectionString ? connectionString.substring(0, 50) + '...' : 'undefined'}`);

async function testConnection() {
  if (!connectionString) {
    console.error('❌ No database connection string found in environment variables');
    console.log('\n💡 Suggestions:');
    console.log('1. Set DATABASE_URL environment variable');
    console.log('2. Check your .env file');
    console.log('3. For Replit: PostgreSQL should be available automatically');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Test basic query
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

      // Count issues
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

    // Provide helpful suggestions
    console.log('\n💡 Suggestions:');
    console.log('1. Check your DATABASE_URL format');
    console.log('2. For Replit: PostgreSQL should be available automatically');
    console.log('3. Verify SSL settings for your PostgreSQL provider');
    console.log('4. Try: npm run check-db (same command)');
  }
}

testConnection();
