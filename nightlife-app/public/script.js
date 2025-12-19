document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadBars();

  const searchBtn = document.getElementById('searchBtn');
  searchBtn.addEventListener('click', () => {
    const location = document.getElementById('locationInput').value.trim();
    if (location) {
      loadBars(location);
    }
  });

  // Allow Enter key to trigger search
  const locationInput = document.getElementById('locationInput');
  locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
});

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      const user = await response.json();
      showAuthenticatedUI(user);
    } else {
      showUnauthenticatedUI();
    }
  } catch (error) {
    showUnauthenticatedUI();
  }
}

function showAuthenticatedUI(user) {
  const authLinks = document.getElementById('authLinks');
  authLinks.innerHTML = `
    <span class="user-info">Welcome, ${user.username}!</span>
    <a href="/logout">Logout</a>
  `;
}

function showUnauthenticatedUI() {
  const authLinks = document.getElementById('authLinks');
  authLinks.innerHTML = '<a href="/login">Login with GitHub</a>';
}

async function loadBars(location = null) {
  const barsContainer = document.getElementById('barsContainer');
  barsContainer.innerHTML = '<div class="loading">Loading bars...</div>';

  try {
    let url = '/api/bars';
    if (location) {
      url += `?location=${encodeURIComponent(location)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch bars');
    }

    const bars = await response.json();
    displayBars(bars, location);

    // Update search info
    if (location) {
      updateSearchInfo(location, bars.length);
    }
  } catch (error) {
    console.error('Error loading bars:', error);
    barsContainer.innerHTML = '<div class="error">Failed to load bars. Please try again.</div>';
  }
}

function updateSearchInfo(location, count) {
  const searchInfo = document.getElementById('searchInfo');
  const searchText = document.getElementById('searchText');
  searchText.textContent = `Showing ${count} bars in ${location}`;
  searchInfo.style.display = 'block';
}

function displayBars(bars) {
  const container = document.getElementById('barsContainer');
  container.innerHTML = '';

  if (bars.length === 0) {
    container.innerHTML = '<div class="no-results">No bars found for this location. Try a different search.</div>';
    return;
  }

  bars.forEach(bar => {
    const barDiv = document.createElement('div');
    barDiv.className = 'bar';

    const reviewText = bar.review_count ? `(${bar.review_count} reviews)` : '';
    const buttonText = bar.isGoing ? "I'm Not Going" : "I'm Going";
    const buttonClass = bar.isGoing ? 'going-btn going' : 'going-btn';

    barDiv.innerHTML = `
      <img src="${bar.image_url}" alt="${bar.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="bar-info">
        <h3><a href="${bar.url}" target="_blank">${bar.name}</a></h3>
        <p class="location">📍 ${bar.location.city}, ${bar.location.state}</p>
        <p class="rating">⭐ ${bar.rating}/5 ${reviewText}</p>
        <p class="going-count">${bar.going || 0} people going tonight</p>
        <button class="${buttonClass}" onclick="toggleRSVP('${bar.id}', this)" id="rsvp-${bar.id}">
          ${buttonText}
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
