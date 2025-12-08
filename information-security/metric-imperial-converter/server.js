const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
app.use(cors({ optionsSuccessStatus: 200 }));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Conversion logic
const conversions = {
  // Length
  gal: { to: 'L', factor: 3.78541, unit: 'gallons' },
  L: { to: 'gal', factor: 1/3.78541, unit: 'liters' },
  mi: { to: 'km', factor: 1.60934, unit: 'miles' },
  km: { to: 'mi', factor: 1/1.60934, unit: 'kilometers' },
  lbs: { to: 'kg', factor: 0.453592, unit: 'pounds' },
  kg: { to: 'lbs', factor: 1/0.453592, unit: 'kilograms' }
};

function convert(input) {
  // Parse input
  const regex = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/;
  const match = input.match(regex);

  if (!match) {
    return { error: 'invalid number and unit' };
  }

  const num = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  // Check if unit is valid
  if (!conversions[unit]) {
    return { error: 'invalid unit' };
  }

  // Check if number is valid
  if (isNaN(num)) {
    return { error: 'invalid number' };
  }

  const conversion = conversions[unit];
  const result = (num * conversion.factor).toFixed(5);
  const resultNum = parseFloat(result);

  return {
    initNum: num,
    initUnit: unit,
    returnNum: resultNum,
    returnUnit: conversion.to,
    string: `${num} ${unit} converts to ${resultNum} ${conversion.to}`
  };
}

// API routes
app.get('/api/convert', (req, res) => {
  const input = req.query.input;

  if (!input) {
    return res.json({ error: 'invalid number and unit' });
  }

  const result = convert(input.trim());
  res.json(result);
});

// For FCC testing
app.post('/api/convert', (req, res) => {
  const input = req.body.input;

  if (!input) {
    return res.json({ error: 'invalid number and unit' });
  }

  const result = convert(input.trim());
  res.json(result);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Metric-Imperial Converter API listening on port ${PORT}`);
});

module.exports = app;
