let stockChart = null;

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const stockSymbolInput = document.getElementById('stockSymbol');

  searchBtn.addEventListener('click', () => {
    const symbol = stockSymbolInput.value.trim().toUpperCase();
    if (symbol) {
      fetchStockData(symbol);
    }
  });

  // Load default stock on page load
  fetchStockData('AAPL');

  // Allow Enter key to search
  stockSymbolInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
});

async function fetchStockData(symbol) {
  try {
    const response = await fetch(`/api/stock/${symbol}`);
    const data = await response.json();

    if (response.ok) {
      renderChart(data);
      displayStockInfo(data);
    } else {
      alert(data.error || 'Failed to fetch stock data');
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    alert('Failed to fetch stock data');
  }
}

function renderChart(stockData) {
  const ctx = document.getElementById('stockChart').getContext('2d');

  // Destroy existing chart if it exists
  if (stockChart) {
    stockChart.destroy();
  }

  const labels = stockData.data.map(item => item.date);
  const prices = stockData.data.map(item => item.close);

  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${stockData.symbol} Stock Price`,
        data: prices,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Price (USD)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `${stockData.symbol} Stock Price Chart`
        }
      }
    }
  });
}

function displayStockInfo(stockData) {
  const stockInfo = document.getElementById('stockInfo');
  const latestData = stockData.data[stockData.data.length - 1];

  stockInfo.innerHTML = `
    <h2>${stockData.symbol} Stock Information</h2>
    <div class="stock-details">
      <div class="detail-item">
        <h3>Current Price</h3>
        <p>$${latestData.close.toFixed(2)}</p>
      </div>
      <div class="detail-item">
        <h3>High</h3>
        <p>$${latestData.high.toFixed(2)}</p>
      </div>
      <div class="detail-item">
        <h3>Low</h3>
        <p>$${latestData.low.toFixed(2)}</p>
      </div>
      <div class="detail-item">
        <h3>Open</h3>
        <p>$${latestData.open.toFixed(2)}</p>
      </div>
      <div class="detail-item">
        <h3>Volume</h3>
        <p>${latestData.volume.toLocaleString()}</p>
      </div>
      <div class="detail-item">
        <h3>Last Updated</h3>
        <p>${new Date(latestData.date).toLocaleDateString()}</p>
      </div>
    </div>
  `;
}
