const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({optionsSuccessStatus: 200}));
app.use(express.static('public'));

// Unit conversion functions
const convertHandler = {
  // Length conversions
  galToL: (initNum) => ({
    result: Math.round(initNum * 3.78541 * 100000) / 100000,
    unit: 'L'
  }),

  lToGal: (initNum) => ({
    result: Math.round(initNum / 3.78541 * 100000) / 100000,
    unit: 'gal'
  }),

  lbsToKg: (initNum) => ({
    result: Math.round(initNum / 2.20462 * 100000) / 100000,
    unit: 'kg'
  }),

  kgToLbs: (initNum) => ({
    result: Math.round(initNum * 2.20462 * 100000) / 100000,
    unit: 'lbs'
  }),

  miToKm: (initNum) => ({
    result: Math.round(initNum * 1.60934 * 100000) / 100000,
    unit: 'km'
  }),

  kmToMi: (initNum) => ({
    result: Math.round(initNum / 1.60934 * 100000) / 100000,
    unit: 'mi'
  })
};

// Parse input function
function parseInput(input) {
  if (!input) return { error: 'invalid number' };

  // Extract number and unit
  const regex = /^(\d+(\.\d+)?)?([a-zA-Z]+)$/;
  const match = input.match(regex);

  if (!match) return { error: 'invalid number and unit' };

  let num = match[1] ? parseFloat(match[1]) : 1;
  let unit = match[3].toLowerCase();

  // Validate unit
  const validUnits = ['gal', 'l', 'lbs', 'kg', 'mi', 'km'];
  if (!validUnits.includes(unit)) {
    return { error: 'invalid unit' };
  }

  // Handle special case for 'L' vs 'l'
  if (unit === 'l') unit = 'L';

  return { num, unit };
}

// Convert function
function convert(num, unit) {
  let result, returnUnit, returnNum;

  switch (unit.toLowerCase()) {
    case 'gal':
      ({ result, unit: returnUnit } = convertHandler.galToL(num));
      returnNum = num;
      break;
    case 'l':
      ({ result: returnNum, unit: returnUnit } = convertHandler.lToGal(num));
      result = num;
      break;
    case 'lbs':
      ({ result, unit: returnUnit } = convertHandler.lbsToKg(num));
      returnNum = num;
      break;
    case 'kg':
      ({ result: returnNum, unit: returnUnit } = convertHandler.kgToLbs(num));
      result = num;
      break;
    case 'mi':
      ({ result, unit: returnUnit } = convertHandler.miToKm(num));
      returnNum = num;
      break;
    case 'km':
      ({ result: returnNum, unit: returnUnit } = convertHandler.kmToMi(num));
      result = num;
      break;
    default:
      return { error: 'invalid unit' };
  }

  return {
    initNum: num,
    initUnit: unit,
    returnNum,
    returnUnit,
    string: `${result} ${unit} converts to ${returnNum} ${returnUnit}`
  };
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/convert', (req, res) => {
  const input = req.query.input;

  if (!input) {
    return res.json({ error: 'invalid number and unit' });
  }

  const parsed = parseInput(input);

  if (parsed.error) {
    return res.json({ error: parsed.error });
  }

  const result = convert(parsed.num, parsed.unit);

  if (result.error) {
    return res.json({ error: result.error });
  }

  res.json(result);
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(__dirname + '/views/404.html');
});

// Start server
app.listen(port, () => {
  console.log(`Metric-Imperial Converter API listening on port ${port}`);
});

module.exports = app;
