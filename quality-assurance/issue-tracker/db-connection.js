const db = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

db.connect(MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

module.exports = db;