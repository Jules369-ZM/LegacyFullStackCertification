const chai = require('chai');
const assert = chai.assert;
const { suite, test } = require('mocha');

const ConvertHandler = require('../controllers/convertHandler.js');

let convertHandler = new ConvertHandler();

suite('Unit Tests', function () {

  test('convertHandler should correctly read a whole number input', function () {
    assert.equal(convertHandler.getNum("32L"), 32);
  });

  test('convertHandler should correctly read a decimal number input', function () {
    assert.equal(convertHandler.getNum("3.5kg"), 3.5);
  });

  test('convertHandler should correctly read a fractional input', function () {
    assert.equal(convertHandler.getNum("1/2km"), 0.5);
  });

  test('convertHandler should correctly read a fractional input with a decimal', function () {
    assert.equal(convertHandler.getNum("3.5/7mi"), 0.5);
  });

  test('convertHandler should correctly return an error on a double-fraction', function () {
    assert.isNaN(convertHandler.getNum("3/2/3km"));
  });

  test('convertHandler should default to 1 when no number is present', function () {
    assert.equal(convertHandler.getNum("kg"), 1);
  });

  test('convertHandler should correctly read each valid input unit', function () {
    const units = ["gal", "l", "lbs", "kg", "mi", "km"];
    units.forEach(u => assert.isNotNull(convertHandler.getUnit("3" + u)));
  });

  test('convertHandler should correctly return an error for an invalid input unit', function () {
    assert.isNull(convertHandler.getUnit("32g"));
  });

  test('convertHandler should return the correct return unit', function () {
    assert.equal(convertHandler.getReturnUnit("gal"), "L");
  });

  test('convertHandler should correctly return the spelled-out unit', function () {
    assert.equal(convertHandler.spellOutUnit("kg"), "kilograms");
  });

  test('convertHandler should correctly convert gal to L', function () {
    assert.approximately(convertHandler.convert(1, "gal"), 3.78541, 0.1);
  });

  test('convertHandler should correctly convert L to gal', function () {
    assert.approximately(convertHandler.convert(1, "L"), 0.26417, 0.1);
  });

  test('convertHandler should correctly convert mi to km', function () {
    assert.approximately(convertHandler.convert(1, "mi"), 1.60934, 0.1);
  });

  test('convertHandler should correctly convert km to mi', function () {
    assert.approximately(convertHandler.convert(1, "km"), 0.62137, 0.1);
  });

});
