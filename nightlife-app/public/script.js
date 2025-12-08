document.addEventListener('DOMContentLoaded', () => {
  loadBars();

  const searchBtn = document.getElementById('searchBtn');
  searchBtn.addEventListener('click', () => {
    const location = document.getElementById('locationInput').value;
    loadBars(location);
  });
});

async function loadBars(location = 'New York, NY') {
  try {
    const response = await fetch(`/api/bars?location=${encodeURIComponent(location)}`);
    const bars = await response.json();
    displayBars(bars);
  } catch (error) {
    console.error('Error loading bars:', error);
  }
}

function displayBars(bars) {
  const container = document.getElementById('barsContainer');
  container.innerHTML = '';

  bars.forEach(bar => {
    const barDiv = document.createElement('div');
    barDiv.className = 'bar';

    barDiv.innerHTML = `
      <img src="${bar.image_url}" alt="${bar.name}">
      <div class="bar-info">
        <h3><a href="${bar.url}" target="_blank">${bar.name}</a></h3>
        <p>Location: ${bar.location.city}, ${bar.location.state}</p>
        <p>Rating: ${bar.rating}/5</p>
        <p>${bar.going} people going</p>
        <button class="going-btn" onclick="toggleRSVP('${bar.id}', this)">
          I'm Going
        </button>
      </div>
    `;

    container.appendChild(barDiv);
  });
}

async function toggleRSVP(barId, button) {
  try {
    const response = await fetch(`/api/bars/${barId}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const barInfo = button.parentElement;
      const goingText = barInfo.querySelector('p:nth-child(4)');
      goingText.textContent = `${data.going} people going`;

      button.classList.toggle('going');
      button.textContent = button.classList.contains('going') ? "I'm Not Going" : "I'm Going";
    } else if (response.status === 401) {
      alert('Please login to RSVP');
      window.location.href = '/login';
    } else {
      alert('Failed to RSVP');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
