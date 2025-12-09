"use strict";

const express = require("express");
const router = express.Router();
const ConvertHandler = require("../controllers/convertHandler");

const convertHandler = new ConvertHandler();

router.get("/convert", (req, res) => {
  const input = req.query.input;

  if (!input) return res.send("invalid number and unit");

  let initNum, initUnit;
  let numError = false;
  let unitError = false;

  try {
    initNum = convertHandler.getNum(input);
  } catch (err) {
    numError = true;
  }

  try {
    initUnit = convertHandler.getUnit(input);
  } catch (err) {
    unitError = true;
  }

  if (numError && unitError) return res.send("invalid number and unit");
  if (numError) return res.send("invalid number");
  if (unitError) return res.send("invalid unit");

  const returnNum = convertHandler.convert(initNum, initUnit);
  const returnUnit = convertHandler.getReturnUnit(initUnit);
  const string = convertHandler.getString(
    initNum,
    initUnit,
    returnNum,
    returnUnit
  );

  res.json({ initNum, initUnit, returnNum, returnUnit, string });
});

module.exports = router;
