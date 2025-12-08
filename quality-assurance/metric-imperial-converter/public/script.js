// Frontend JavaScript for Metric-Imperial Converter

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('converter-form');
  const input = document.getElementById('input');
  const result = document.getElementById('result');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const inputValue = input.value.trim();

    if (!inputValue) {
      displayResult('Please enter a value and unit to convert.', true);
      return;
    }

    // Make API request
    fetch(`/api/convert?input=${encodeURIComponent(inputValue)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          displayResult(data.error, true);
        } else {
          displayResult(`${data.initNum} ${data.initUnit} converts to ${data.returnNum} ${data.returnUnit}`, false);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        displayResult('An error occurred while converting. Please try again.', true);
      });
  });

  function displayResult(message, isError) {
    result.textContent = message;
    result.className = isError ? 'error' : '';

    // Clear input after successful conversion
    if (!isError) {
      input.value = '';
    }
  }

  // Focus on input when page loads
  input.focus();

  // Allow Enter key to submit form
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      form.dispatchEvent(new Event('submit'));
    }
  });
});
