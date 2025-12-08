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
  gal: { to: 'L', factor: 3.78541, unit: 'gallons', returnUnit: 'liters' },
  l: { to: 'gal', factor: 1/3.78541, unit: 'liters', returnUnit: 'gallons' },
  L: { to: 'gal', factor: 1/3.78541, unit: 'liters', returnUnit: 'gallons' },
  mi: { to: 'km', factor: 1.60934, unit: 'miles', returnUnit: 'kilometers' },
  km: { to: 'mi', factor: 1/1.60934, unit: 'kilometers', returnUnit: 'miles' },
  lbs: { to: 'kg', factor: 0.453592, unit: 'pounds', returnUnit: 'kilograms' },
  kg: { to: 'lbs', factor: 1/0.453592, unit: 'kilograms', returnUnit: 'pounds' }
};

// Function to parse number (handles fractions, decimals, etc.)
function parseNumber(input) {
  if (!input) return 1; // Default to 1 if no number provided

  // Handle fractions like 1/2, 2.5/6
  if (input.includes('/')) {
    const parts = input.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    // Invalid fraction
    return NaN;
  }

  // Handle decimals
  const num = parseFloat(input);
  return isNaN(num) ? NaN : num;
}

function convert(input) {
  // Parse input - find first letter to separate number from unit
  const firstLetterIndex = input.search(/[a-zA-Z]/);

  if (firstLetterIndex === -1) {
    return { error: 'invalid number and unit' };
  }

  const numberPart = input.substring(0, firstLetterIndex).trim();
  const unitPart = input.substring(firstLetterIndex).trim();

  // Parse number
  const initNum = parseNumber(numberPart);
  if (isNaN(initNum)) {
    return { error: 'invalid number' };
  }

  // Parse unit (preserve case for L)
  let initUnit = unitPart.toLowerCase();
  if (unitPart.toUpperCase() === 'L') {
    initUnit = 'L';
  }

  // Check if unit is valid
  if (!conversions[initUnit]) {
    return { error: 'invalid unit' };
  }

  const conversion = conversions[initUnit];
  const returnNum = parseFloat((initNum * conversion.factor).toFixed(5));

  return {
    initNum: initNum,
    initUnit: initUnit,
    returnNum: returnNum,
    returnUnit: conversion.to,
    string: `${initNum} ${conversion.unit} converts to ${returnNum} ${conversion.returnUnit}`
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
