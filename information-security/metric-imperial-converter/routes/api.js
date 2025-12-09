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

    if (number === "invalid number" && unit === "invalid unit") {
      return res.status(200).type('text').send('invalid number and unit');
    }
    if (number === "invalid number") {
      return res.status(200).type('text').send('invalid number');
    }
    if (unit === "invalid unit") {
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
      string,
    });
  });

  return router;
}();
