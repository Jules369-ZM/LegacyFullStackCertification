const chai = require('chai');
const assert = chai.assert;
const { suite, test } = require('mocha');
const ConvertHandler = require('../controllers/convertHandler');

let convertHandler = new ConvertHandler();

suite('Unit Tests', function() {

  test('Whole number input', function() {
    assert.isNotNaN(convertHandler.getNum('5kg'));
  });

  test('Decimal input', function() {
    assert.isNotNaN(convertHandler.getNum('1.54kg'));
  });

  test('Fractional input', function() {
    assert.isNotNaN(convertHandler.getNum('1/2kg'));
  });

  test('Fractional input with decimal', function() {
    assert.isNotNaN(convertHandler.getNum('1/2.5kg'));
  });

  test('Valid unit input', function() {
    assert.strictEqual(convertHandler.getUnit('1km'), 'km');
    assert.strictEqual(convertHandler.getUnit('0.5mi'), 'mi');
    assert.strictEqual(convertHandler.getUnit('1/0.5l'), 'l');
    assert.strictEqual(convertHandler.getUnit('1/2gal'), 'gal');
    assert.strictEqual(convertHandler.getUnit('1kg'), 'kg');
    assert.strictEqual(convertHandler.getUnit('1lbs'), 'lbs');
  });

  test('Correct return unit', function() {
    assert.strictEqual(convertHandler.getReturnUnit('km'), 'mi');
    assert.strictEqual(convertHandler.getReturnUnit('mi'), 'km');
    assert.strictEqual(convertHandler.getReturnUnit('l'), 'gal');
    assert.strictEqual(convertHandler.getReturnUnit('gal'), 'l');
    assert.strictEqual(convertHandler.getReturnUnit('kg'), 'lbs');
    assert.strictEqual(convertHandler.getReturnUnit('lbs'), 'kg');
  });

  test('Spell out unit', function() {
    assert.strictEqual(convertHandler.spellOutUnit('km'), 'kilometers');
    assert.strictEqual(convertHandler.spellOutUnit('mi'), 'miles');
    assert.strictEqual(convertHandler.spellOutUnit('l'), 'liters');
    assert.strictEqual(convertHandler.spellOutUnit('gal'), 'gallons');
    assert.strictEqual(convertHandler.spellOutUnit('kg'), 'kilograms');
    assert.strictEqual(convertHandler.spellOutUnit('lbs'), 'pounds');
  });

  test('Conversion gal to L', function() {
    assert.strictEqual(convertHandler.convert(3, 'gal'), 11.35623);
  });

  test('Conversion L to gal', function() {
    assert.strictEqual(convertHandler.convert(3, 'l'), 0.79252);
  });

  test('Conversion mi to km', function() {
    assert.strictEqual(convertHandler.convert(3, 'mi'), 4.82802);
  });

  test('Conversion km to mi', function() {
    assert.strictEqual(convertHandler.convert(3, 'km'), 1.86412);
  });

  test('Conversion lbs to kg', function() {
    assert.strictEqual(convertHandler.convert(3, 'lbs'), 1.36078);
  });

  test('Conversion kg to lbs', function() {
    assert.strictEqual(convertHandler.convert(3, 'kg'), 6.61387);
  });

});
