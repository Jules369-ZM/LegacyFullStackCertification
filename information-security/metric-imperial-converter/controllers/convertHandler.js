function ConvertHandler() {
  const validUnits = ["gal", "l", "lbs", "kg", "mi", "km"];

  const unitMap = {
    gal: "gal",
    l: "L",
    lbs: "lbs",
    kg: "kg",
    mi: "mi",
    km: "km",
  };

  const returnUnitMap = {
    gal: "L",
    L: "gal",
    lbs: "kg",
    kg: "lbs",
    mi: "km",
    km: "mi",
  };

  const spellOut = {
    gal: "gallons",
    L: "liters",
    lbs: "pounds",
    kg: "kilograms",
    mi: "miles",
    km: "kilometers",
  };

  const factors = {
    gal: 3.78541,
    L: 1 / 3.78541,
    lbs: 0.453592,
    kg: 1 / 0.453592,
    mi: 1.60934,
    km: 1 / 1.60934,
  };

  // GET NUMBER
  this.getNum = function (input) {
    const index = input.search(/[a-zA-Z]/);

    if (index === -1) return NaN;

    const numPart = input.substring(0, index).trim();

    if (numPart === "") return 1;

    if (numPart.split("/").length > 2) return NaN;

    if (numPart.includes("/")) {
      const [a, b] = numPart.split("/");
      if (isNaN(a) || isNaN(b)) return NaN;
      return parseFloat(a) / parseFloat(b);
    }

    if (isNaN(numPart)) return NaN;

    return parseFloat(numPart);
  };

  // GET UNIT
  this.getUnit = function (input) {
    const index = input.search(/[a-zA-Z]/);
    if (index === -1) return null;

    const unitPart = input.substring(index).toLowerCase();

    if (unitPart === "l") return "L";

    return validUnits.includes(unitPart) ? unitMap[unitPart] : null;
  };

  this.getReturnUnit = function (initUnit) {
    return returnUnitMap[initUnit] || null;
  };

  this.spellOutUnit = function (unit) {
    return spellOut[unit] || null;
  };

  this.convert = function (initNum, initUnit) {
    if (!factors[initUnit]) return null;
    return parseFloat((initNum * factors[initUnit]).toFixed(5));
  };

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(
      initUnit
    )} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
}

module.exports = ConvertHandler;
