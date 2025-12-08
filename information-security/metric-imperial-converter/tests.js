const chai = require('chai');
const assert = chai.assert;
const ConvertHandler = require('./controllers/convertHandler.js');

let convertHandler = new ConvertHandler();

const { suite, test } = require('mocha');

suite('Unit Tests', function(){
  suite('Function convertHandler.getNum(input)', function() {
    test('convertHandler should correctly read a whole number input.', function() {
      assert.equal(convertHandler.getNum('32L'), 32);
      assert.equal(convertHandler.getNum('5gal'), 5);
    });

    test('convertHandler should correctly read a decimal number input.', function() {
      assert.equal(convertHandler.getNum('3.5L'), 3.5);
      assert.equal(convertHandler.getNum('2.7gal'), 2.7);
    });

    test('convertHandler should correctly read a fractional input.', function() {
      assert.equal(convertHandler.getNum('1/2L'), 0.5);
      assert.equal(convertHandler.getNum('3/4gal'), 0.75);
    });

    test('convertHandler should correctly read a fractional input with a decimal.', function() {
      assert.equal(convertHandler.getNum('2.5/2L'), 1.25);
      assert.equal(convertHandler.getNum('5.4/3gal'), 1.8);
    });

    test('convertHandler should correctly return an error on a double-fraction (i.e. 3/2/3).', function() {
      assert.isNaN(convertHandler.getNum('3/2/3L'));
      assert.isNaN(convertHandler.getNum('5/4/2gal'));
    });

    test('convertHandler should correctly default to a numerical input of 1 when no numerical input is provided.', function() {
      assert.equal(convertHandler.getNum('L'), 1);
      assert.equal(convertHandler.getNum('gal'), 1);
    });
  });

  suite('Function convertHandler.getUnit(input)', function() {
    test('convertHandler should correctly read each valid input unit.', function() {
      assert.equal(convertHandler.getUnit('gal'), 'gal');
      assert.equal(convertHandler.getUnit('L'), 'L');
      assert.equal(convertHandler.getUnit('l'), 'L');
      assert.equal(convertHandler.getUnit('mi'), 'mi');
      assert.equal(convertHandler.getUnit('km'), 'km');
      assert.equal(convertHandler.getUnit('lbs'), 'lbs');
      assert.equal(convertHandler.getUnit('kg'), 'kg');
    });

    test('convertHandler should correctly return an error for an invalid input unit.', function() {
      assert.isNull(convertHandler.getUnit('g'));
      assert.isNull(convertHandler.getUnit('invalid'));
      assert.isNull(convertHandler.getUnit('123'));
    });
  });

  suite('Function convertHandler.getReturnUnit(initUnit)', function() {
    test('convertHandler should return the correct return unit for each valid input unit.', function() {
      assert.equal(convertHandler.getReturnUnit('gal'), 'L');
      assert.equal(convertHandler.getReturnUnit('L'), 'gal');
      assert.equal(convertHandler.getReturnUnit('mi'), 'km');
      assert.equal(convertHandler.getReturnUnit('km'), 'mi');
      assert.equal(convertHandler.getReturnUnit('lbs'), 'kg');
      assert.equal(convertHandler.getReturnUnit('kg'), 'lbs');
    });
  });

  suite('Function convertHandler.spellOutUnit(unit)', function() {
    test('convertHandler should correctly return the spelled-out string unit for each valid input unit.', function() {
      assert.equal(convertHandler.spellOutUnit('gal'), 'gallons');
      assert.equal(convertHandler.spellOutUnit('L'), 'liters');
      assert.equal(convertHandler.spellOutUnit('mi'), 'miles');
      assert.equal(convertHandler.spellOutUnit('km'), 'kilometers');
      assert.equal(convertHandler.spellOutUnit('lbs'), 'pounds');
      assert.equal(convertHandler.spellOutUnit('kg'), 'kilograms');
    });
  });

  suite('Function convertHandler.convert(num, unit)', function() {
    test('convertHandler should correctly convert gal to L.', function() {
      assert.equal(convertHandler.convert(1, 'gal'), 3.78541);
      assert.equal(convertHandler.convert(5, 'gal'), 18.92705);
    });

    test('convertHandler should correctly convert L to gal.', function() {
      assert.equal(convertHandler.convert(3.78541, 'L'), 1);
      assert.equal(convertHandler.convert(7.57082, 'L'), 2);
    });

    test('convertHandler should correctly convert mi to km.', function() {
      assert.equal(convertHandler.convert(1, 'mi'), 1.60934);
      assert.equal(convertHandler.convert(5, 'mi'), 8.04670);
    });

    test('convertHandler should correctly convert km to mi.', function() {
      assert.equal(convertHandler.convert(1.60934, 'km'), 1);
      assert.equal(convertHandler.convert(8.04670, 'km'), 5);
    });

    test('convertHandler should correctly convert lbs to kg.', function() {
      assert.equal(convertHandler.convert(1, 'lbs'), 0.45359);
      assert.equal(convertHandler.convert(5, 'lbs'), 2.26796);
    });

    test('convertHandler should correctly convert kg to lbs.', function() {
      assert.equal(convertHandler.convert(0.45359, 'kg'), 1);
      assert.equal(convertHandler.convert(2.26796, 'kg'), 5);
    });
  });
});
