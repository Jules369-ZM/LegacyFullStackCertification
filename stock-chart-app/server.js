const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stockchart');

// Stock Schema
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const Stock = mongoose.model('Stock', stockSchema);

// Global stocks array (in-memory for demo, could be persisted to DB)
let activeStocks = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API routes for managing stocks
app.get('/api/stocks', (req, res) => {
  res.json(activeStocks);
});

app.post('/api/stocks', async (req, res) => {
  try {
    const { symbol } = req.body;
    const upperSymbol = symbol.toUpperCase();

    if (activeStocks.includes(upperSymbol)) {
      return res.status(400).json({ error: 'Stock already added' });
    }

    // Validate stock exists by trying to fetch data
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (apiKey) {
      try {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol: upperSymbol,
            apikey: apiKey
          }
        });

        if (!response.data['Time Series (Daily)']) {
          return res.status(404).json({ error: 'Stock symbol not found' });
        }
      } catch (error) {
        return res.status(404).json({ error: 'Stock symbol not found' });
      }
    }

    activeStocks.push(upperSymbol);
    io.emit('stockAdded', upperSymbol); // Broadcast to all clients
    res.json({ symbol: upperSymbol, stocks: activeStocks });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

app.delete('/api/stocks/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const index = activeStocks.indexOf(symbol);

  if (index === -1) {
    return res.status(404).json({ error: 'Stock not found' });
  }

  activeStocks.splice(index, 1);
  io.emit('stockRemoved', symbol); // Broadcast to all clients
  res.json({ symbol, stocks: activeStocks });
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

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current stocks to new user
  socket.emit('stocksUpdate', activeStocks);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Stock chart app listening on port ${PORT}`);
});
