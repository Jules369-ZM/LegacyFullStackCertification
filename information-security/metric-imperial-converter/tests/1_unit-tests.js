const chai = require("chai");
const assert = chai.assert;
const ConvertHandler = require("../controllers/convertHandler.js");

// Add this at the top of both test files
const mocha = require('mocha');
const suite = mocha.suite;
const test = mocha.test;
// OR use global mocha functions
// const { suite, test } = mocha;
suite("Unit Tests", function () {
  const convertHandler = new ConvertHandler();

  test("convertHandler should correctly read a whole number input.", function () {
    assert.strictEqual(convertHandler.getNum("32L"), 32);
  });

  test("convertHandler should correctly read a decimal number input.", function () {
    assert.strictEqual(convertHandler.getNum("3.5kg"), 3.5);
  });

  test("convertHandler should correctly read a fractional input.", function () {
    assert.strictEqual(convertHandler.getNum("1/2mi"), 0.5);
  });

  test("convertHandler should correctly read a fractional input with a decimal.", function () {
    assert.strictEqual(convertHandler.getNum("3.5/7kg"), 0.5);
  });

  test("convertHandler should correctly return an error on a double-fraction (i.e. 3/2/3).", function () {
    let errorThrown = false;
    let errorMessage = "";
    try {
      convertHandler.getNum("3/2/3km");
    } catch (err) {
      errorThrown = true;
      errorMessage = err;
    }
    assert.isTrue(errorThrown, "Should throw an error for double fraction");
    assert.strictEqual(errorMessage, "invalid number");
  });

  test("convertHandler should correctly default to a numerical input of 1 when no numerical input is provided.", function () {
    assert.strictEqual(convertHandler.getNum("kg"), 1);
  });

  test("convertHandler should correctly read each valid input unit.", function () {
    assert.strictEqual(convertHandler.getUnit("1km"), "km");
    assert.strictEqual(convertHandler.getUnit("0.5mi"), "mi");
    assert.strictEqual(convertHandler.getUnit("1/0.5l"), "L");
    assert.strictEqual(convertHandler.getUnit("1/2gal"), "gal");
    assert.strictEqual(convertHandler.getUnit("1kg"), "kg");
    assert.strictEqual(convertHandler.getUnit("1lbs"), "lbs");
  });

  test("convertHandler should correctly return an error for an invalid input unit.", function () {
    let errorThrown = false;
    let errorMessage = "";
    try {
      convertHandler.getUnit("32g");
    } catch (err) {
      errorThrown = true;
      errorMessage = err;
    }
    assert.isTrue(errorThrown, "Should throw an error for invalid unit");
    assert.strictEqual(errorMessage, "invalid unit");
  });

  test("convertHandler should return the correct return unit for each valid input unit.", function () {
    assert.strictEqual(convertHandler.getReturnUnit("km"), "mi");
    assert.strictEqual(convertHandler.getReturnUnit("mi"), "km");
    assert.strictEqual(convertHandler.getReturnUnit("L"), "gal");
    assert.strictEqual(convertHandler.getReturnUnit("gal"), "L");
    assert.strictEqual(convertHandler.getReturnUnit("kg"), "lbs");
    assert.strictEqual(convertHandler.getReturnUnit("lbs"), "kg");
  });

  test("convertHandler should correctly return the spelled-out string unit for each valid input unit.", function () {
    assert.strictEqual(convertHandler.spellOutUnit("km"), "kilometers");
    assert.strictEqual(convertHandler.spellOutUnit("mi"), "miles");
    assert.strictEqual(convertHandler.spellOutUnit("L"), "liters");
    assert.strictEqual(convertHandler.spellOutUnit("gal"), "gallons");
    assert.strictEqual(convertHandler.spellOutUnit("kg"), "kilograms");
    assert.strictEqual(convertHandler.spellOutUnit("lbs"), "pounds");
  });

  test("convertHandler should correctly convert gal to L.", function () {
    assert.approximately(convertHandler.convert(3, "gal"), 11.35623, 0.00001);
  });

  test("convertHandler should correctly convert L to gal.", function () {
    assert.approximately(convertHandler.convert(3, "L"), 0.79252, 0.00001);
  });

  test("convertHandler should correctly convert mi to km.", function () {
    assert.approximately(convertHandler.convert(3, "mi"), 4.82802, 0.00001);
  });

  test("convertHandler should correctly convert km to mi.", function () {
    assert.approximately(convertHandler.convert(3, "km"), 1.86412, 0.00001);
  });

  test("convertHandler should correctly convert lbs to kg.", function () {
    assert.approximately(convertHandler.convert(3, "lbs"), 1.36078, 0.00001);
  });

  test("convertHandler should correctly convert kg to lbs.", function () {
    assert.approximately(convertHandler.convert(3, "kg"), 6.61387, 0.00001);
  });
});
