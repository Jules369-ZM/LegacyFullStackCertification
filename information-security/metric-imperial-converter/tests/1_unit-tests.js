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
    assert.isNaN(convertHandler.getNum('3/2/3km'));
  });

  test('Default to 1', function() {
    assert.equal(convertHandler.getNum('kg'), 1);
  });

  test('Valid unit input', function() {
    const units = ['gal','L','lbs','kg','mi','km'];
    units.forEach(u => assert.isNotNull(convertHandler.getUnit('3'+u)));
  });

  test('Invalid unit input', function() {
    assert.isNull(convertHandler.getUnit('32g'));
  });

  test('Correct return unit', function() {
    assert.equal(convertHandler.getReturnUnit('gal'),'L');
    assert.equal(convertHandler.getReturnUnit('L'),'gal');
    assert.equal(convertHandler.getReturnUnit('lbs'),'kg');
    assert.equal(convertHandler.getReturnUnit('kg'),'lbs');
    assert.equal(convertHandler.getReturnUnit('mi'),'km');
    assert.equal(convertHandler.getReturnUnit('km'),'mi');
  });

  test('Spell out unit', function() {
    assert.equal(convertHandler.spellOutUnit('kg'),'kilograms');
  });

  test('Conversion gal to L', function() {
    assert.approximately(convertHandler.convert(1,'gal'),3.78541,0.1);
  });

  test('Conversion L to gal', function() {
    assert.approximately(convertHandler.convert(1,'L'),0.26417,0.1);
  });

  test('Conversion mi to km', function() {
    assert.approximately(convertHandler.convert(1,'mi'),1.60934,0.1);
  });

  test('Conversion km to mi', function() {
    assert.approximately(convertHandler.convert(1,'km'),0.62137,0.1);
  });

  test('Conversion lbs to kg', function() {
    assert.approximately(convertHandler.convert(1,'lbs'),0.45359,0.1);
  });

  test('Conversion kg to lbs', function() {
    assert.approximately(convertHandler.convert(1,'kg'),2.20462,0.1);
  });

});
