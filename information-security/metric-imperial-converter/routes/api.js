const express = require('express');
const ConvertHandler = require('../controllers/convertHandler.js');

const router = express.Router();
const convertHandler = new ConvertHandler();

// GET /api/convert
router.get('/convert', (req, res) => {
  const input = req.query.input;

  if (!input) {
    return res.send('invalid number and unit');
  }

  // Parse input - find first letter to separate number from unit
  const firstLetterIndex = input.search(/[a-zA-Z]/);

  if (firstLetterIndex === -1) {
    return res.send('invalid number and unit');
  }

  const numberPart = input.substring(0, firstLetterIndex).trim();
  const unitPart = input.substring(firstLetterIndex).trim();

  // Parse number
  const initNum = convertHandler.getNum(numberPart);
  if (isNaN(initNum)) {
    // Check if it's invalid unit by trying to parse unit first
    const lowerUnit = unitPart.toLowerCase();
    if (lowerUnit === 'l') lowerUnit = 'L';
    if (!convertHandler.validUnits[lowerUnit]) {
      return res.send('invalid number and unit');
    }
    return res.send('invalid number');
  }

  // Parse and validate unit
  const lowerUnit = unitPart.toLowerCase();
  const normalizedUnit = lowerUnit === 'l' ? 'L' : lowerUnit;

  if (!convertHandler.validUnits[normalizedUnit]) {
    return res.send('invalid unit');
  }

  const initUnit = convertHandler.validUnits[normalizedUnit]; // This will be 'L' for both 'l' and 'L' inputs
  const returnUnit = convertHandler.getReturnUnit(normalizedUnit);

  const returnNum = convertHandler.convert(initNum, normalizedUnit);

  const result = {
    initNum: initNum,
    initUnit: initUnit.toLowerCase() === 'l' ? 'L' : initUnit.toLowerCase(), // initUnit should be lowercase except L
    returnNum: returnNum,
    returnUnit: returnUnit,
    string: convertHandler.getString(initNum, normalizedUnit, returnNum, returnUnit)
  };

  res.json(result);
});

// POST /api/convert (for FCC testing)
router.post('/convert', (req, res) => {
  const input = req.body.input;

  if (!input) {
    return res.send('invalid number and unit');
  }

  // Parse input - find first letter to separate number from unit
  const firstLetterIndex = input.search(/[a-zA-Z]/);

  if (firstLetterIndex === -1) {
    return res.send('invalid number and unit');
  }

  const numberPart = input.substring(0, firstLetterIndex).trim();
  const unitPart = input.substring(firstLetterIndex).trim();

  // Parse number
  const initNum = convertHandler.getNum(numberPart);
  if (isNaN(initNum)) {
    // Check if it's invalid unit by trying to parse unit first
    const lowerUnit = unitPart.toLowerCase();
    if (lowerUnit === 'l') lowerUnit = 'L';
    if (!convertHandler.validUnits[lowerUnit]) {
      return res.send('invalid number and unit');
    }
    return res.send('invalid number');
  }

  // Parse and validate unit
  const lowerUnit = unitPart.toLowerCase();
  const normalizedUnit = lowerUnit === 'l' ? 'L' : lowerUnit;

  if (!convertHandler.validUnits[normalizedUnit]) {
    return res.send('invalid unit');
  }

  const initUnit = convertHandler.validUnits[normalizedUnit]; // This will be 'L' for both 'l' and 'L' inputs
  const returnUnit = convertHandler.getReturnUnit(normalizedUnit);

  const returnNum = convertHandler.convert(initNum, normalizedUnit);

  const result = {
    initNum: initNum,
    initUnit: initUnit.toLowerCase() === 'l' ? 'L' : initUnit.toLowerCase(), // initUnit should be lowercase except L
    returnNum: returnNum,
    returnUnit: returnUnit,
    string: convertHandler.getString(initNum, normalizedUnit, returnNum, returnUnit)
  };

  res.json(result);
});

module.exports = router;
