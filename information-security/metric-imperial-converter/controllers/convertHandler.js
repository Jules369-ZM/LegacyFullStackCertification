"use strict";

function ConvertHandler() {
  const validUnits = ["gal", "L", "lbs", "kg", "mi", "km"];

  this.getNum = function (input) {
    if (!input) return 1;
    const numMatch = input.match(/^[\d/.]+/);
    const numStr = numMatch ? numMatch[0] : "";
    if (!numStr) return 1;

    if (numStr.includes("/")) {
      const nums = numStr.split("/");
      if (nums.length !== 2) throw "invalid number";
      const numerator = parseFloat(nums[0]);
      const denominator = parseFloat(nums[1]);
      if (isNaN(numerator) || isNaN(denominator)) throw "invalid number";
      return numerator / denominator;
    } else {
      const val = parseFloat(numStr);
      if (isNaN(val)) throw "invalid number";
      return val;
    }
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
