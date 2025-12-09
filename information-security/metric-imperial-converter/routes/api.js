'use strict';

const express = require('express');
const router = express.Router();
const ConvertHandler = require('../controllers/convertHandler');

module.exports = function () {
  const convertHandler = new ConvertHandler();

  router.get('/convert', (req, res) => {
    try {
      const input = req.query.input
      const initNum = convertHandler.getNum(req.query.input)
      const initUnit = convertHandler.getUnit(req.query.input)
      const returnNum = convertHandler.convert(initNum, initUnit)
      const returnUnit = convertHandler.getReturnUnit(initUnit)
      const string = convertHandler.getString(initNum, initUnit, returnNum, returnUnit)
      res.json({
        initNum,
        initUnit,
        returnNum,
        returnUnit,
        string
      })
    } catch (error) {
      res.json(error)
    }
  });

  return router;
}();
