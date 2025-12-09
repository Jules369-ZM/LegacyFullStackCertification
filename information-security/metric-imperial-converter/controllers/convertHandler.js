function ConvertHandler() {
  const units = ['gal','l','lbs','kg','mi','km'];

  const returnUnitMap = {
    gal: 'L',
    L: 'gal',
    lbs: 'kg',
    kg: 'lbs',
    mi: 'km',
    km: 'mi'
  };

  const spelled = {
    gal: 'gallons',
    L: 'liters',
    lbs: 'pounds',
    kg: 'kilograms',
    mi: 'miles',
    km: 'kilometers'
  };

  const factors = {
    gal: 3.78541,
    L: 1/3.78541,
    lbs: 0.453592,
    kg: 1/0.453592,
    mi: 1.60934,
    km: 1/1.60934
  };

  this.getNum = function(input) {
    if (!input) return 1;
    const match = input.match(/^[\d\.\/]+/);
    if (!match) return 1;

    const numStr = match[0];
    if (numStr.split('/').length > 2) return NaN;

    if (numStr.includes('/')) {
      let [a,b] = numStr.split('/');
      if (isNaN(a) || isNaN(b)) return NaN;
      return parseFloat(a)/parseFloat(b);
    }

    return isNaN(numStr) ? NaN : parseFloat(numStr);
  };

  this.getUnit = function(input) {
    if (!input) return null;
    const match = input.match(/[a-zA-Z]+$/);
    if (!match) return null;

    let unit = match[0].toLowerCase();
    if (unit === 'l') return 'L';

    return units.includes(unit) ? unit : null;
  };

  this.getReturnUnit = function(unit) {
    return returnUnitMap[unit];
  };

  this.spellOutUnit = function(unit) {
    return spelled[unit];
  };

  this.convert = function(num, unit) {
    return parseFloat((num * factors[unit]).toFixed(5));
  };

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
}

module.exports = ConvertHandler;
