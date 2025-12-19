const socket = io();
let charts = {}; // Store chart instances by symbol
let currentStocks = []; // Array of active stock symbols

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addBtn');
  const stockSymbolInput = document.getElementById('stockSymbol');

  // Add stock button
  addBtn.addEventListener('click', () => {
    const symbol = stockSymbolInput.value.trim().toUpperCase();
    if (symbol) {
      addStock(symbol);
      stockSymbolInput.value = '';
    }
  });

  // Allow Enter key to add stock
  stockSymbolInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });

  // WebSocket event listeners
  socket.on('stocksUpdate', (stocks) => {
    console.log('Stocks update received:', stocks);
    currentStocks = stocks;
    updateStocksDisplay();
  });

  socket.on('stockAdded', (symbol) => {
    console.log('Stock added by another user:', symbol);
    if (!currentStocks.includes(symbol)) {
      currentStocks.push(symbol);
      updateStocksDisplay();
      showNotification(`📈 ${symbol} was added by another user`);
    }
  });

  socket.on('stockRemoved', (symbol) => {
    console.log('Stock removed by another user:', symbol);
    const index = currentStocks.indexOf(symbol);
    if (index !== -1) {
      currentStocks.splice(index, 1);
      removeStockChart(symbol);
      showNotification(`📉 ${symbol} was removed by another user`);
    }
  });

  // Load initial stocks
  loadCurrentStocks();
});

async function loadCurrentStocks() {
  try {
    const response = await fetch('/api/stocks');
    const stocks = await response.json();
    currentStocks = stocks;
    updateStocksDisplay();
  } catch (error) {
    console.error('Error loading stocks:', error);
  }
}

async function addStock(symbol) {
  if (currentStocks.includes(symbol)) {
    showNotification('⚠️ This stock is already being tracked', 'warning');
    return;
  }

  showLoading(true);

  try {
    const response = await fetch('/api/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbol })
    });

    const data = await response.json();

    if (response.ok) {
      currentStocks = data.stocks;
      updateStocksDisplay();
      showNotification(`✅ ${symbol} added successfully`);
    } else {
      showNotification(`❌ ${data.error || 'Failed to add stock'}`, 'error');
    }
  } catch (error) {
    console.error('Error adding stock:', error);
    showNotification('❌ Failed to add stock', 'error');
  } finally {
    showLoading(false);
  }
}

async function removeStock(symbol) {
  if (!confirm(`Remove ${symbol} from tracking?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/stocks/${symbol}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      currentStocks = data.stocks;
      removeStockChart(symbol);
      showNotification(`🗑️ ${symbol} removed`);
    } else {
      showNotification(`❌ ${data.error || 'Failed to remove stock'}`, 'error');
    }
  } catch (error) {
    console.error('Error removing stock:', error);
    showNotification('❌ Failed to remove stock', 'error');
  }
}

async function updateStocksDisplay() {
  const container = document.getElementById('stocksContainer');

  if (currentStocks.length === 0) {
    container.innerHTML = `
      <div class="welcome-message">
        <h2>Welcome to Stock Market Chart</h2>
        <p>Add stock symbols above to view their price trends. All users see the same charts in real-time!</p>
        <div class="example-stocks">
          <span>Try: </span>
          <button class="example-btn" onclick="addStock('AAPL')">AAPL</button>
          <button class="example-btn" onclick="addStock('GOOGL')">GOOGL</button>
          <button class="example-btn" onclick="addStock('MSFT')">MSFT</button>
          <button class="example-btn" onclick="addStock('TSLA')">TSLA</button>
        </div>
      </div>
    `;
    return;
  }

  // Keep existing charts, only add new ones
  for (const symbol of currentStocks) {
    if (!charts[symbol]) {
      await createStockChart(symbol);
    }
  }

  // Remove charts for stocks that are no longer tracked
  Object.keys(charts).forEach(symbol => {
    if (!currentStocks.includes(symbol)) {
      removeStockChart(symbol);
    }
  });
}

async function createStockChart(symbol) {
  try {
    const response = await fetch(`/api/stock/${symbol}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch data for', symbol, data.error);
      return;
    }

    const chartContainer = document.createElement('div');
    chartContainer.className = 'stock-chart-container';
    chartContainer.id = `chart-${symbol}`;

    chartContainer.innerHTML = `
      <div class="chart-header">
        <h3>${symbol} Stock Price</h3>
        <button class="remove-btn" onclick="removeStock('${symbol}')">×</button>
      </div>
      <div class="chart-wrapper">
        <canvas id="canvas-${symbol}"></canvas>
      </div>
      <div class="stock-stats" id="stats-${symbol}"></div>
    `;

    const stocksContainer = document.getElementById('stocksContainer');
    const welcomeMessage = stocksContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }
    stocksContainer.appendChild(chartContainer);

    renderChart(symbol, data);
    displayStockStats(symbol, data);
  } catch (error) {
    console.error('Error creating chart for', symbol, error);
  }
}

function renderChart(symbol, stockData) {
  const ctx = document.getElementById(`canvas-${symbol}`).getContext('2d');

  const labels = stockData.data.map(item => item.date);
  const prices = stockData.data.map(item => item.close);

  // Generate random color for this stock
  const colors = [
    { border: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.2)' },
    { border: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.2)' },
    { border: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.2)' },
    { border: 'rgb(255, 206, 86)', bg: 'rgba(255, 206, 86, 0.2)' },
    { border: 'rgb(153, 102, 255)', bg: 'rgba(153, 102, 255, 0.2)' },
    { border: 'rgb(255, 159, 64)', bg: 'rgba(255, 159, 64, 0.2)' }
  ];

  const colorIndex = Object.keys(charts).length % colors.length;
  const colorScheme = colors[colorIndex];

  charts[symbol] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${symbol} Price`,
        data: prices,
        borderColor: colorScheme.border,
        backgroundColor: colorScheme.bg,
        tension: 0.1,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${symbol}: $${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return '$' + value.toFixed(2);
            }
          }
        },
        x: {
          display: false // Hide x-axis labels for cleaner look
        }
      }
    }
  });
}

function displayStockStats(symbol, stockData) {
  const statsDiv = document.getElementById(`stats-${symbol}`);
  const latestData = stockData.data[stockData.data.length - 1];
  const previousData = stockData.data[stockData.data.length - 2];

  let change = 0;
  let changePercent = 0;

  if (previousData) {
    change = latestData.close - previousData.close;
    changePercent = (change / previousData.close) * 100;
  }

  const changeClass = change >= 0 ? 'positive' : 'negative';
  const changeSymbol = change >= 0 ? '↑' : '↓';

  statsDiv.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Current:</span>
      <span class="stat-value">$${latestData.close.toFixed(2)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Change:</span>
      <span class="stat-value ${changeClass}">${changeSymbol} $${Math.abs(change).toFixed(2)} (${Math.abs(changePercent).toFixed(2)}%)</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">High:</span>
      <span class="stat-value">$${latestData.high.toFixed(2)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Low:</span>
      <span class="stat-value">$${latestData.low.toFixed(2)}</span>
    </div>
  `;
}

function removeStockChart(symbol) {
  const chartContainer = document.getElementById(`chart-${symbol}`);
  if (chartContainer) {
    chartContainer.remove();
  }

  if (charts[symbol]) {
    charts[symbol].destroy();
    delete charts[symbol];
  }
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  loading.style.display = show ? 'block' : 'none';
}

function showNotification(message, type = 'info') {
  // Simple notification - could be enhanced with a proper notification system
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Make addStock function global so it can be called from HTML
window.addStock = addStock;
window.removeStock = removeStock;
