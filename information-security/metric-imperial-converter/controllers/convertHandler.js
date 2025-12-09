"use strict";

function ConvertHandler() {
  const validUnits = ["gal", "L", "lbs", "kg", "mi", "km"];

  // In convertHandler.js - UPDATE getNum method:
  this.getNum = function (input) {
    // Find the unit first
    const unitMatch = input.match(/[a-zA-Z]+$/);
    if (!unitMatch) throw "invalid number";

    const unitIndex = unitMatch.index;
    const numStr = input.substring(0, unitIndex).trim();

    // If no number provided
    if (!numStr || numStr === "") {
      return 1;
    }

    // Check for invalid double fractions like 3/2/3
    if ((numStr.match(/\//g) || []).length > 1) {
      throw "invalid number";
    }

    // Check for multiple decimals
    if ((numStr.match(/\./g) || []).length > 1) {
      throw "invalid number";
    }

    // Handle fractions
    if (numStr.includes("/")) {
      const parts = numStr.split("/");
      if (parts.length !== 2) throw "invalid number";

      const numerator = parts[0];
      const denominator = parts[1];

      // Check if both parts are valid numbers
      if (
        isNaN(numerator) ||
        isNaN(denominator) ||
        numerator.trim() === "" ||
        denominator.trim() === ""
      ) {
        throw "invalid number";
      }

      const num = parseFloat(numerator);
      const den = parseFloat(denominator);

      if (den === 0) {
        throw "invalid number";
      }

      const result = num / den;
      if (isNaN(result) || !isFinite(result)) {
        throw "invalid number";
      }

      return result;
    }

    // Handle decimals or whole numbers
    const result = parseFloat(numStr);
    if (isNaN(result) || !isFinite(result)) {
      throw "invalid number";
    }

    return result;
  };

  this.getUnit = function (input) {
    if (!input) throw "invalid unit";
    const unitMatch = input.match(/[a-zA-Z]+$/);
    if (!unitMatch) throw "invalid unit";
    let unit = unitMatch[0].toLowerCase();
    if (unit === "l") unit = "L";
    if (!validUnits.includes(unit)) throw "invalid unit";
    return unit;
  };

  this.getReturnUnit = function (initUnit) {
    const map = {
      gal: "L",
      L: "gal",
      lbs: "kg",
      kg: "lbs",
      mi: "km",
      km: "mi",
    };
    return map[initUnit];
  };

  this.spellOutUnit = function (unit) {
    const map = {
      gal: "gallons",
      L: "liters",
      lbs: "pounds",
      kg: "kilograms",
      mi: "miles",
      km: "kilometers",
    };
    return map[unit];
  };

  this.convert = function (initNum, initUnit) {
    const galToL = 3.78541,
      lbsToKg = 0.453592,
      miToKm = 1.60934;
    let result;
    switch (initUnit) {
      case "gal":
        result = initNum * galToL;
        break;
      case "L":
        result = initNum / galToL;
        break;
      case "lbs":
        result = initNum * lbsToKg;
        break;
      case "kg":
        result = initNum / lbsToKg;
        break;
      case "mi":
        result = initNum * miToKm;
        break;
      case "km":
        result = initNum / miToKm;
        break;
      default:
        result = null;
        break;
    }
    return parseFloat(result.toFixed(5));
  };

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    const spelledInit = this.spellOutUnit(initUnit);
    const spelledReturn = this.spellOutUnit(returnUnit);
    const init = parseFloat(initNum.toFixed(5));
    const ret = parseFloat(returnNum.toFixed(5));
    return `${init} ${spelledInit} converts to ${ret} ${spelledReturn}`;
  };
}

module.exports = ConvertHandler;
