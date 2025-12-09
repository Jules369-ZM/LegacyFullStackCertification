const chai = require('chai');
const assert = chai.assert;
const { suite, test } = require('mocha');
const ConvertHandler = require('../controllers/convertHandler');

let convertHandler = new ConvertHandler();

suite('Unit Tests', function() {

  test('Whole number input', function() {
    assert.equal(convertHandler.getNum('32L'), 32);
  });

  test('Decimal input', function() {
    assert.equal(convertHandler.getNum('3.5kg'), 3.5);
  });

  test('Fractional input', function() {
    assert.equal(convertHandler.getNum('1/2mi'), 0.5);
  });

  test('Fractional input with decimal', function() {
    assert.equal(convertHandler.getNum('3.5/7kg'), 0.5);
  });

  test('Double fraction input', function() {
    assert.equal(convertHandler.getNum('3/2/3km'), 'invalid number');
  });

  test('Default to 1', function() {
    assert.equal(convertHandler.getNum('kg'), 1);
  });

  test('Valid unit input', function() {
    assert.equal(convertHandler.getUnit('2gal'), 'gal');
    assert.equal(convertHandler.getUnit('2L'), 'L');
    assert.equal(convertHandler.getUnit('2mi'), 'mi');
    assert.equal(convertHandler.getUnit('2km'), 'km');
    assert.equal(convertHandler.getUnit('2lbs'), 'lbs');
    assert.equal(convertHandler.getUnit('2kg'), 'kg');
  });

  test('Invalid unit input', function() {
    assert.equal(convertHandler.getUnit('32g'), 'invalid unit');
  });

  test('Correct return unit', function() {
    assert.equal(convertHandler.getReturnUnit('gal'), 'L');
    assert.equal(convertHandler.getReturnUnit('L'), 'gal');
    assert.equal(convertHandler.getReturnUnit('mi'), 'km');
    assert.equal(convertHandler.getReturnUnit('km'), 'mi');
    assert.equal(convertHandler.getReturnUnit('lbs'), 'kg');
    assert.equal(convertHandler.getReturnUnit('kg'), 'lbs');
  });

  test('Spell out unit', function() {
    assert.equal(convertHandler.spellOutUnit('GAL'), 'gal');
    assert.equal(convertHandler.spellOutUnit('l'), 'L');
    assert.equal(convertHandler.spellOutUnit('MI'), 'mi');
    assert.equal(convertHandler.spellOutUnit('KM'), 'km');
    assert.equal(convertHandler.spellOutUnit('LBS'), 'lbs');
    assert.equal(convertHandler.spellOutUnit('KG'), 'kg');
  });

  test('Conversion gal to L', function() {
    assert.equal(convertHandler.convert(2, 'gal'), 7.57082);
  });

  test('Conversion L to gal', function() {
    assert.equal(convertHandler.convert(2, 'L'), 0.52834);
  });

  test('Conversion mi to km', function() {
    assert.equal(convertHandler.convert(2, 'mi'), 3.21868);
  });

  test('Conversion km to mi', function() {
    assert.equal(convertHandler.convert(2, 'km'), 1.24275);
  });

  test('Conversion lbs to kg', function() {
    assert.equal(convertHandler.convert(2, 'lbs'), 0.90718);
  });

  test('Conversion kg to lbs', function() {
    assert.equal(convertHandler.convert(2, 'kg'), 4.40925);
  });

});
