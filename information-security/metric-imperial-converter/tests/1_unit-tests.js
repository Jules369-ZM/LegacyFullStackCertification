const chai = require('chai');
const assert = chai.assert;
const { suite, test } = require('mocha');

const ConvertHandler = require('../controllers/convertHandler');
let convertHandler = new ConvertHandler();

suite('Unit Tests', () => {
  test('Whole number input', () => {
    assert.equal(convertHandler.getNum('32'), 32);
  });

  test('Decimal input', () => {
    assert.equal(convertHandler.getNum('3.2'), 3.2);
  });

  test('Fractional input', () => {
    assert.equal(convertHandler.getNum('3/2'), 1.5);
  });

  test('Fractional input with decimal', () => {
    assert.equal(convertHandler.getNum('3.5/0.5'), 7);
  });

  test('Invalid multiple fractions', () => {
    assert.isNaN(convertHandler.getNum('3/2/3'));
  });

  test('Default to 1', () => {
    assert.equal(convertHandler.getNum('kg'), 1);
  });

  test('Valid unit input', () => {
    assert.equal(convertHandler.getUnit('kg'), 'kg');
  });

  test('Invalid unit input', () => {
    assert.isNull(convertHandler.getUnit('55x'));
  });

  test('Correct return unit', () => {
    assert.equal(convertHandler.getReturnUnit('mi'), 'km');
  });

  test('Spell out unit', () => {
    assert.equal(convertHandler.spellOutUnit('km'), 'kilometers');
  });

  test('Correct conversion', () => {
    assert.approximately(convertHandler.convert(5, 'gal'), 18.92705, 0.1);
  });

});
