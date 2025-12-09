'use strict';

const express = require('express');
const router = express.Router();
const ConvertHandler = require('../controllers/convertHandler');

module.exports = function () {
  const convertHandler = new ConvertHandler();

  router.get('/convert', (req, res) => {
    const input = req.query.input || '';

    // Split number and unit at first letter
    const index = input.search(/[a-zA-Z]/);
    const numStr = index === -1 ? input : input.slice(0, index).trim();
    const unitStr = index === -1 ? '' : input.slice(index).trim();

    // NOTE: per FCC design, pass only the numeric substring to getNum
    const number = convertHandler.getNum(numStr);
    const unit = convertHandler.getUnit(unitStr);

    const numberIsInvalid = isNaN(number);
    const unitIsInvalid = unit === null;

    if (numberIsInvalid && unitIsInvalid) {
      // FCC expects this exact plain text
      return res.status(200).type('text').send('invalid number and unit');
    }
    if (numberIsInvalid) {
      return res.status(200).type('text').send('invalid number');
    }
    if (unitIsInvalid) {
      return res.status(200).type('text').send('invalid unit');
    }

    const returnUnit = convertHandler.getReturnUnit(unit);
    const returnNum = convertHandler.convert(number, unit);
    const string = convertHandler.getString(number, unit, returnNum, returnUnit);

    res.json({
      initNum: number,
      initUnit: unit,
      returnNum,
      returnUnit,
      string
    });
  });

  return router;
}();
