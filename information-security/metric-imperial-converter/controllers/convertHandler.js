function ConvertHandler() {

  this.getNum = function(input) {
    let result
    // regex for fraction input
    const validInputRegex = new RegExp(/^(\d+(\.\d+)?(\/\d+(\.\d*)?)?)?\w+$/)
    if (validInputRegex.test(input)) {
      // match the numbers in input (There should be one if it's whole or decimal and two if it's a fraction)
      const numbers = input.match(/\d+(\.\d+)?/g)
      if (numbers === null) {
        // No numbers in input
        result = 1
      } else if (numbers.length === 1) {
        // decimal or whole
        result = parseFloat(numbers[0])
      } else if (numbers.length === 2) {
        // fraction
        result = parseFloat(numbers[0]) / parseFloat(numbers[1])
      } else {
        throw 'invalid number'
      }
    } else {
      throw 'invalid number'
    }
    return result
  }

  this.getUnit = function(input) {
    // check if input has a matching unit
    let match = input.match(/(l|L|gal|kg|lbs|km|mi)$/)
    if (match) {
      let unit = match[0].toLowerCase()
      return unit === 'l' ? 'L' : unit
    } else {
      throw 'invalid unit'
    }
  }

  this.getReturnUnit = function(initUnit) {
    const units = {
      'mi': 'km',
      'km': 'mi',
      'gal': 'L',
      'L': 'gal',
      'lbs': 'kg',
      'kg': 'lbs'
    }
    let result = units[initUnit]

    return result
  }

  this.spellOutUnit = function(unit) {
    const units = {
      'mi': 'miles',
      'km': 'kilometers',
      'gal': 'gallons',
      'L': 'liters',
      'lbs': 'pounds',
      'kg': 'kilograms'
    }
    let result = units[unit]

    return result
  }

  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541
    const lbsToKg = 0.453592
    const miToKm = 1.60934
    let result
    switch (initUnit) {
      case 'mi':
        result = initNum * miToKm
        break
      case 'km':
        result = initNum / miToKm
        break
      case 'gal':
        result = initNum * galToL
        break
      case 'L':
        result = initNum / galToL
        break
      case 'lbs':
        result = initNum * lbsToKg
        break
      case 'kg':
        result = initNum / lbsToKg
        break

      default:
        result = null
        break
    }
    return parseFloat(result.toFixed(5))
  }

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    if (initNum === null || initUnit === null) {
      console.log('test')
      return 'invalid input'
    }
    let speltInitUnit = this.spellOutUnit(initUnit)
    let speltReturnUnit = this.spellOutUnit(returnUnit)
    let result = `${initNum} ${speltInitUnit} converts to ${returnNum} ${speltReturnUnit}`

    return result
  }

}

module.exports = ConvertHandler
