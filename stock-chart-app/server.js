const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Database connection (optional, for storing favorite stocks)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockchart');

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API route for stock data
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      // Return mock data if no API key
      return res.json({
        symbol,
        data: generateMockStockData()
      });
    }

    // Alpha Vantage API call
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: apiKey
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      return res.status(404).json({ error: 'Stock symbol not found' });
    }

    // Process the data for charting
    const data = Object.entries(timeSeries).slice(0, 30).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).reverse();

    res.json({ symbol, data });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Mock data generator for demo
function generateMockStockData() {
  const data = [];
  let price = 100 + Math.random() * 50;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.5) * 10;
    price += change;
    price = Math.max(price, 10); // Keep price positive

    data.push({
      date: date.toISOString().split('T')[0],
      open: price,
      high: price + Math.random() * 5,
      low: price - Math.random() * 5,
      close: price + (Math.random() - 0.5) * 2,
      volume: Math.floor(Math.random() * 1000000)
    });
  }

  return data;
}

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Stock chart app listening on port ${PORT}`);
});
