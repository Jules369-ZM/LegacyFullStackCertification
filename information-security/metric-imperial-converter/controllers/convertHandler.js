function ConvertHandler() {
  const validUnits = ["gal", "L", "lbs", "kg", "mi", "km"];

  const returnUnitMap = {
    gal: "L",
    L: "gal",
    lbs: "kg",
    kg: "lbs",
    mi: "km",
    km: "mi"
  };

  const spelled = {
    gal: "gallons",
    L: "liters",
    lbs: "pounds",
    kg: "kilograms",
    mi: "miles",
    km: "kilometers"
  };

  const factors = {
    gal: 3.78541,
    L: 1 / 3.78541,
    lbs: 0.453592,
    kg: 1 / 0.453592,
    mi: 1.60934,
    km: 1 / 1.60934
  };

  // GET NUMBER
  this.getNum = function (input) {
    if (!input) return 1;

    // only letters → default to 1
    if (/^[a-zA-Z]+$/.test(input)) return 1;

    // more than one slash → invalid
    if (input.split("/").length > 2) return NaN;

    // fraction
    if (input.includes("/")) {
      let [a, b] = input.split("/");
      if (isNaN(a) || isNaN(b)) return NaN;
      return parseFloat(a) / parseFloat(b);
    }

    // normal number
    if (isNaN(input)) return NaN;

    return parseFloat(input);
  };

  // GET UNIT
  this.getUnit = function (input) {
    if (!input) return null;
    input = input.toLowerCase();

    if (input === "l") return "L";

    return validUnits.includes(input) ? input : null;
  };

  this.getReturnUnit = function (initUnit) {
    return returnUnitMap[initUnit] || null;
  };

  this.spellOutUnit = function (unit) {
    return spelled[unit] || null;
  };

  // CONVERSION
  this.convert = function (initNum, initUnit) {
    return parseFloat((initNum * factors[initUnit]).toFixed(5));
  };

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(
      initUnit
    )} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
}

module.exports = ConvertHandler;
