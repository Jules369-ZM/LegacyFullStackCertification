function ConvertHandler() {
  const unitMap = {
    gal: "gal",
    l: "L",
    lbs: "lbs",
    kg: "kg",
    mi: "mi",
    km: "km"
  };

  const returnUnitMap = {
    gal: "L",
    L: "gal",
    lbs: "kg",
    kg: "lbs",
    mi: "km",
    km: "mi"
  };

  const spellOut = {
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
  this.getNum = function(input) {
    if (!input || input.trim() === "") return 1;

    // Check if input contains only letters (no numbers) - should default to 1
    if (/^[a-zA-Z]+$/.test(input.trim())) return 1;

    // Extract number part (everything before first letter)
    const firstLetterIndex = input.search(/[a-zA-Z]/);
    const numberPart = firstLetterIndex === -1 ? input : input.substring(0, firstLetterIndex).trim();

    if (numberPart === "") return 1;

    // check for invalid double fraction
    if (numberPart.split("/").length > 2) return NaN;

    if (numberPart.includes("/")) {
      let [a, b] = numberPart.split("/");
      if (isNaN(a) || isNaN(b)) return NaN;
      return parseFloat(a) / parseFloat(b);
    }

    if (isNaN(numberPart)) return NaN;

    return parseFloat(numberPart);
  };

  // GET UNIT
  this.getUnit = function(input) {
    if (!input) return null;
    const lower = input.toLowerCase();
    if (lower === "l") return "L";
    return unitMap[lower] || null;
  };

  this.getReturnUnit = function(initUnit) {
    return returnUnitMap[initUnit] || null;
  };

  this.spellOutUnit = function(unit) {
    return spellOut[unit] || null;
  };

  // CONVERT FUNCTION
  this.convert = function(initNum, initUnit) {
    if (!initUnit || !factors[initUnit]) return null;
    let result = initNum * factors[initUnit];
    return parseFloat(result.toFixed(5));
  };

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(
      initUnit
    )} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
}

module.exports = ConvertHandler;
