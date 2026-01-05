// Telephone Number Validator JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const userInput = document.getElementById('user-input');
  const checkBtn = document.getElementById('check-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultsDiv = document.getElementById('results-div');

  // Add event listener to the check button
  checkBtn.addEventListener('click', function() {
    const inputValue = userInput.value.trim();

    // Check if input is empty
    if (inputValue === '') {
      alert('Please provide a phone number');
      return;
    }

    // Check if the input is a valid US phone number
    const isValid = telephoneCheck(inputValue);

    // Display the result
    displayResult(inputValue, isValid);
  });

  // Add event listener to the clear button
  clearBtn.addEventListener('click', function() {
    resultsDiv.textContent = '';
    resultsDiv.className = 'results';
  });

  // Function to check if a string is a valid US phone number
  function telephoneCheck(str) {
    // Regular expression for valid US phone number formats
    const phoneRegex = /^(1\s?)?(\(\d{3}\)|\d{3})[\s\-]?\d{3}[\s\-]?\d{4}$/;

    // Check if the string matches the regex pattern
    if (!phoneRegex.test(str)) {
      return false;
    }

    // Additional validation for area code in parentheses
    const parenMatch = str.match(/\(\d{3}\)/);
    if (parenMatch) {
      // If there are parentheses, they should be properly formatted
      const openParenIndex = str.indexOf('(');
      const closeParenIndex = str.indexOf(')');
      if (closeParenIndex - openParenIndex !== 4) {
        return false;
      }
    }

    // Check for valid digit count (10 or 11 digits)
    const digitsOnly = str.replace(/\D/g, '');
    if (digitsOnly.length === 11) {
      // If 11 digits, first digit must be 1
      return digitsOnly[0] === '1';
    } else if (digitsOnly.length === 10) {
      return true;
    }

    return false;
  }

  // Function to display the result
  function displayResult(inputValue, isValid) {
    const resultText = isValid ?
      `Valid US number: ${inputValue}` :
      `Invalid US number: ${inputValue}`;

    // Clear previous classes
    resultsDiv.className = 'results';

    // Add appropriate class for styling
    if (isValid) {
      resultsDiv.classList.add('valid');
    } else {
      resultsDiv.classList.add('invalid');
    }

    // Set the result text
    resultsDiv.textContent = resultText;
  }
});
