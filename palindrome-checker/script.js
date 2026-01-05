// Palindrome Checker JavaScript

document.addEventListener('DOMContentLoaded', function() {
  const textInput = document.getElementById('text-input');
  const checkBtn = document.getElementById('check-btn');
  const resultDiv = document.getElementById('result');

  // Add event listener to the check button
  checkBtn.addEventListener('click', function() {
    const inputText = textInput.value.trim();

    // Check if input is empty
    if (inputText === '') {
      alert('Please input a value');
      return;
    }

    // Check if the input is a palindrome
    const isPalindrome = checkPalindrome(inputText);

    // Display the result
    displayResult(inputText, isPalindrome);
  });

  // Function to check if a string is a palindrome
  function checkPalindrome(str) {
    // Remove non-alphanumeric characters and convert to lowercase
    const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Check if the string is equal to its reverse
    return cleaned === cleaned.split('').reverse().join('');
  }

  // Function to display the result
  function displayResult(inputText, isPalindrome) {
    const resultText = `${inputText} ${isPalindrome ? 'is a palindrome' : 'is not a palindrome'}`;

    // Clear previous classes
    resultDiv.className = 'result';

    // Add appropriate class for styling
    if (isPalindrome) {
      resultDiv.classList.add('palindrome');
    } else {
      resultDiv.classList.add('not-palindrome');
    }

    // Set the result text
    resultDiv.textContent = resultText;
  }
});
