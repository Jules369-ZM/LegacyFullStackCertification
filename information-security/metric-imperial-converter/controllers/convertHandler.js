function ConvertHandler() {
  // Valid units mapping
  this.validUnits = {
    'gal': 'gal',
    'l': 'L',    // lowercase l should return uppercase L
    'L': 'L',    // uppercase L stays uppercase L
    'mi': 'mi',
    'km': 'km',
    'lbs': 'lbs',
    'kg': 'kg'
  };

  // Conversion factors and strings
  this.conversions = {
    gal: { to: 'L', factor: 3.78541, unitString: 'gallons', returnUnitString: 'liters' },
    l: { to: 'L', factor: 1/3.78541, unitString: 'liters', returnUnitString: 'liters' },
    L: { to: 'gal', factor: 1/3.78541, unitString: 'liters', returnUnitString: 'gallons' },
    mi: { to: 'km', factor: 1.60934, unitString: 'miles', returnUnitString: 'kilometers' },
    km: { to: 'mi', factor: 1/1.60934, unitString: 'kilometers', returnUnitString: 'miles' },
    lbs: { to: 'kg', factor: 0.453592, unitString: 'pounds', returnUnitString: 'kilograms' },
    kg: { to: 'lbs', factor: 1/0.453592, unitString: 'kilograms', returnUnitString: 'pounds' }
  };

  this.getNum = function(input) {
    if (!input || input.trim() === '') return 1; // Default to 1 if no number provided

    // Check if input contains only letters (no numbers) - should default to 1
    if (/^[a-zA-Z]+$/.test(input.trim())) return 1;

    // Handle fractions like 1/2, 2.5/6
    if (input.includes('/')) {
      const parts = input.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return num / den;
        }
      }
      // Invalid fraction
      return NaN;
    }

    // Handle decimals
    const num = parseFloat(input);
    return isNaN(num) ? NaN : num;
  };

  this.getUnit = function(input) {
    const lowerInput = input.toLowerCase();
    const unit = lowerInput === 'l' ? 'L' : lowerInput;
    return this.validUnits[unit] || null;
  };

  this.getReturnUnit = function(initUnit) {
    return this.conversions[initUnit].to;
  };

  this.spellOutUnit = function(unit) {
    return this.conversions[unit].unitString;
  };

  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;

    let result;

    switch (initUnit) {
      case 'gal':
        result = initNum * galToL;
        break;
      case 'L':
        result = initNum / galToL;
        break;
      case 'lbs':
        result = initNum * lbsToKg;
        break;
      case 'kg':
        result = initNum / lbsToKg;
        break;
      case 'mi':
        result = initNum * miToKm;
        break;
      case 'km':
        result = initNum / miToKm;
        break;
      default:
        return null;
    }

    return parseFloat(result.toFixed(5));
  };

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    const initUnitString = this.spellOutUnit(initUnit);
    const returnUnitString = this.conversions[initUnit].returnUnitString;
    return `${initNum} ${initUnitString} converts to ${returnNum} ${returnUnitString}`;
  };
}

module.exports = ConvertHandler;
