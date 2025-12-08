const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

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

// Conversion logic - exact FreeCodeCamp specifications
const conversions = {
  gal: { to: 'L', factor: 3.78541, unitString: 'gallons', returnUnitString: 'liters' },
  l: { to: 'L', factor: 1/3.78541, unitString: 'liters', returnUnitString: 'liters' },
  L: { to: 'gal', factor: 1/3.78541, unitString: 'liters', returnUnitString: 'gallons' },
  mi: { to: 'km', factor: 1.60934, unitString: 'miles', returnUnitString: 'kilometers' },
  km: { to: 'mi', factor: 1/1.60934, unitString: 'kilometers', returnUnitString: 'miles' },
  lbs: { to: 'kg', factor: 0.453592, unitString: 'pounds', returnUnitString: 'kilograms' },
  kg: { to: 'lbs', factor: 1/0.453592, unitString: 'kilograms', returnUnitString: 'pounds' }
};

// Valid units mapping
const validUnits = {
  'gal': 'gal',
  'l': 'L',    // lowercase l should return uppercase L
  'L': 'L',    // uppercase L stays uppercase L
  'mi': 'mi',
  'km': 'km',
  'lbs': 'lbs',
  'kg': 'kg'
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
    return 'invalid number and unit';
  }

  const numberPart = input.substring(0, firstLetterIndex).trim();
  const unitPart = input.substring(firstLetterIndex).trim();

  // Parse number
  const initNum = parseNumber(numberPart);
  if (isNaN(initNum)) {
    // Check if it's invalid unit by trying to parse unit first
    const lowerUnit = unitPart.toLowerCase();
    if (lowerUnit === 'l') lowerUnit = 'L';
    if (!validUnits[lowerUnit]) {
      return 'invalid number and unit';
    }
    return 'invalid number';
  }

  // Parse and validate unit
  const lowerUnit = unitPart.toLowerCase();
  const normalizedUnit = lowerUnit === 'l' ? 'L' : lowerUnit;

  if (!validUnits[normalizedUnit]) {
    return 'invalid unit';
  }

  const initUnit = validUnits[normalizedUnit]; // This will be 'L' for both 'l' and 'L' inputs
  const returnUnit = conversions[normalizedUnit].to;

  const conversion = conversions[normalizedUnit];
  const returnNum = parseFloat((initNum * conversion.factor).toFixed(5));

  return {
    initNum: initNum,
    initUnit: initUnit.toLowerCase() === 'l' ? 'L' : initUnit.toLowerCase(), // initUnit should be lowercase except L
    returnNum: returnNum,
    returnUnit: returnUnit,
    string: `${initNum} ${conversion.unitString} converts to ${returnNum} ${conversion.returnUnitString}`
  };
}

// API routes
app.get('/api/convert', (req, res) => {
  const input = req.query.input;

  if (!input) {
    return res.send('invalid number and unit');
  }

  const result = convert(input.trim());

  if (typeof result === 'string') {
    return res.send(result);
  }

  res.json(result);
});

// For FCC testing
app.post('/api/convert', (req, res) => {
  const input = req.body.input;

  if (!input) {
    return res.send('invalid number and unit');
  }

  const result = convert(input.trim());

  if (typeof result === 'string') {
    return res.send(result);
  }

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
