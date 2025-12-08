function convertToRoman(num) {
  // Roman numeral conversion table
  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' }
  ];

  let result = '';

  // Iterate through the roman numerals table
  for (const { value, symbol } of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }

  return result;
}

// Test cases
console.log(convertToRoman(2)); // II
console.log(convertToRoman(3)); // III
console.log(convertToRoman(4)); // IV
console.log(convertToRoman(5)); // V
console.log(convertToRoman(9)); // IX
console.log(convertToRoman(12)); // XII
console.log(convertToRoman(16)); // XVI
console.log(convertToRoman(29)); // XXIX
console.log(convertToRoman(44)); // XLIV
console.log(convertToRoman(45)); // XLV
console.log(convertToRoman(68)); // LXVIII
console.log(convertToRoman(83)); // LXXXIII
console.log(convertToRoman(97)); // XCVII
console.log(convertToRoman(99)); // XCIX
console.log(convertToRoman(400)); // CD
console.log(convertToRoman(500)); // D
console.log(convertToRoman(501)); // DI
console.log(convertToRoman(649)); // DCXLIX
console.log(convertToRoman(798)); // DCCXCVIII
console.log(convertToRoman(891)); // DCCCXCI
console.log(convertToRoman(1000)); // M
console.log(convertToRoman(1004)); // MIV
console.log(convertToRoman(1006)); // MVI
console.log(convertToRoman(1023)); // MXXIII
console.log(convertToRoman(2014)); // MMXIV
console.log(convertToRoman(3999)); // MMMCMXCIX
