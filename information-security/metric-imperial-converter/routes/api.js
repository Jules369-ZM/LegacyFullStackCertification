'use strict';

const express = require('express');
const router = express.Router();
const ConvertHandler = require('../controllers/convertHandler');

module.exports = function () {
  const convertHandler = new ConvertHandler();

  router.get('/convert', (req, res) => {
    const input = req.query.input;
    const number = convertHandler.getNum(input);
    const unit = convertHandler.getUnit(input);

    if (number === NaN && unit === null) {
      return res.json({ error: 'invalid number and unit' });
    }

    if (number === NaN) {
      return res.json({ error: 'invalid number' });
    }

    if (unit === null) {
      return res.json({ error: 'invalid unit' });
    }

    const returnUnit = convertHandler.getReturnUnit(unit);
    const returnNum = convertHandler.convert(number, unit);
    const message = convertHandler.getString(number, unit, returnNum, returnUnit);

    res.json({
      initNum: number,
      initUnit: unit,
      returnNum,
      returnUnit,
      string: message
    });
  });

  return router;
}();
