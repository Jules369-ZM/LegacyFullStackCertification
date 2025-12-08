// OpenWeatherMap API configuration
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Free API key (replace with your own)
const API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const app = document.getElementById('app');
const weatherContainer = document.getElementById('weather-container');
const locationElement = document.getElementById('location');
const tempElement = document.getElementById('temp');
const unitElement = document.getElementById('unit');
const weatherIcon = document.getElementById('weather-icon');
const descriptionElement = document.getElementById('description');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const pressureElement = document.getElementById('pressure');
const visibilityElement = document.getElementById('visibility');
const unitToggle = document.getElementById('unit-toggle');
const toggleText = document.getElementById('toggle-text');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');

// Weather data storage
let currentWeather = null;
let isCelsius = true;

// Initialize app
function init() {
  showLoading();
  getLocation();
}

// Get user's location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      error => {
        console.log('Geolocation error:', error);
        // Fallback to IP-based location
        getWeatherByIP();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  } else {
    // Fallback for browsers without geolocation
    getWeatherByIP();
  }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(`${API_BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await response.json();

    if (data.cod === 200) {
      currentWeather = data;
      displayWeather(data);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    showError();
  }
}

// Fallback: Get weather by IP location
async function getWeatherByIP() {
  try {
    // Get location by IP
    const ipResponse = await fetch('https://ipapi.co/json/');
    const locationData = await ipResponse.json();

    if (locationData.city && locationData.country_name) {
      const city = locationData.city;
      const country = locationData.country_code;
      await getWeatherByCity(`${city},${country}`);
    } else {
      throw new Error('Could not determine location');
    }
  } catch (error) {
    console.error('IP location error:', error);
    showError();
  }
}

// Get weather by city name
async function getWeatherByCity(city) {
  try {
    const response = await fetch(`${API_BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    const data = await response.json();

    if (data.cod === 200) {
      currentWeather = data;
      displayWeather(data);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    showError();
  }
}

// Display weather data
function displayWeather(data) {
  hideLoading();
  hideError();

  // Location
  const city = data.name;
  const country = data.sys.country;
  locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>${city}, ${country}</span>`;

  // Temperature (start with Celsius)
  const tempCelsius = Math.round(data.main.temp);
  tempElement.textContent = tempCelsius;
  unitElement.textContent = '°C';

  // Weather icon
  const iconCode = data.weather[0].icon;
  const iconClass = getWeatherIcon(iconCode);
  weatherIcon.className = `fas ${iconClass}`;

  // Description
  descriptionElement.textContent = data.weather[0].description;

  // Details
  humidityElement.textContent = data.main.humidity;
  windElement.textContent = data.wind.speed;
  pressureElement.textContent = data.main.pressure;

  // Visibility (convert from meters to km)
  const visibilityKm = (data.visibility / 1000).toFixed(1);
  visibilityElement.textContent = visibilityKm;

  // Show weather container
  weatherContainer.style.display = 'block';
}

// Get appropriate weather icon
function getWeatherIcon(iconCode) {
  const iconMap = {
    '01d': 'fa-sun',           // clear sky day
    '01n': 'fa-moon',          // clear sky night
    '02d': 'fa-cloud-sun',     // few clouds day
    '02n': 'fa-cloud-moon',    // few clouds night
    '03d': 'fa-cloud',         // scattered clouds
    '03n': 'fa-cloud',         // scattered clouds
    '04d': 'fa-cloud',         // broken clouds
    '04n': 'fa-cloud',         // broken clouds
    '09d': 'fa-cloud-rain',    // shower rain
    '09n': 'fa-cloud-rain',    // shower rain
    '10d': 'fa-cloud-sun-rain', // rain day
    '10n': 'fa-cloud-moon-rain', // rain night
    '11d': 'fa-bolt',          // thunderstorm
    '11n': 'fa-bolt',          // thunderstorm
    '13d': 'fa-snowflake',     // snow
    '13n': 'fa-snowflake',     // snow
    '50d': 'fa-smog',          // mist
    '50n': 'fa-smog'           // mist
  };

  return iconMap[iconCode] || 'fa-cloud';
}

// Toggle temperature units
unitToggle.addEventListener('click', () => {
  if (!currentWeather) return;

  isCelsius = !isCelsius;
  const temp = currentWeather.main.temp;

  if (isCelsius) {
    const tempCelsius = Math.round(temp);
    tempElement.textContent = tempCelsius;
    unitElement.textContent = '°C';
    toggleText.textContent = 'Switch to °F';
  } else {
    const tempFahrenheit = Math.round((temp * 9/5) + 32);
    tempElement.textContent = tempFahrenheit;
    unitElement.textContent = '°F';
    toggleText.textContent = 'Switch to °C';
  }
});

// Show loading state
function showLoading() {
  loading.classList.remove('hidden');
  weatherContainer.style.display = 'none';
  errorMessage.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
  loading.classList.add('hidden');
}

// Show error message
function showError() {
  hideLoading();
  weatherContainer.style.display = 'none';
  errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
  errorMessage.classList.add('hidden');
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', init);
