// Roman Numeral Converter JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const numberInput = document.getElementById('number');
  const convertBtn = document.getElementById('convert-btn');
  const outputDiv = document.getElementById('output');

  // Add event listener to the convert button
  convertBtn.addEventListener('click', function() {
    const inputValue = numberInput.value.trim();

    // Check if input is empty
    if (inputValue === '') {
      displayResult('Please enter a valid number', false);
      return;
    }

    const num = parseInt(inputValue);

    // Check if number is valid
    if (isNaN(num)) {
      displayResult('Please enter a valid number', false);
      return;
    }

    // Check if number is less than 1
    if (num < 1) {
      displayResult('Please enter a number greater than or equal to 1', false);
      return;
    }

    // Check if number is greater than 3999
    if (num >= 4000) {
      displayResult('Please enter a number less than or equal to 3999', false);
      return;
    }

    // Convert to Roman numeral
    const romanNumeral = convertToRoman(num);
    displayResult(romanNumeral, true);
  });

  // Function to convert Arabic numeral to Roman numeral
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

  // Function to display the result
  function displayResult(text, isSuccess) {
    // Clear previous classes
    outputDiv.className = 'output';

    // Add appropriate class for styling
    if (isSuccess) {
      outputDiv.classList.add('success');
    } else {
      outputDiv.classList.add('error');
    }

    // Set the result text
    outputDiv.textContent = text;
  }
});
