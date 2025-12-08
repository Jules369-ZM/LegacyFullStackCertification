const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS
app.use(cors({optionsSuccessStatus: 200}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stock price cache to reduce API calls
const stockCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get stock price
async function getStockPrice(symbol) {
  try {
    // Check cache first
    const cached = stockCache.get(symbol);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.price;
    }

    // For demo purposes, we'll use a mock API response
    // In a real implementation, you would use a stock API like Alpha Vantage, IEX Cloud, etc.
    const mockPrice = 150 + Math.random() * 50; // Random price between 150-200

    // Cache the result
    stockCache.set(symbol, {
      price: mockPrice,
      timestamp: Date.now()
    });

    return mockPrice;
  } catch (error) {
    throw new Error('Failed to fetch stock price');
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Stock Price Checker API');
});

// GET /api/stock-prices
app.get('/api/stock-prices', async (req, res) => {
  try {
    const { stock } = req.query;

    if (!stock) {
      return res.json({ error: 'Stock symbol is required' });
    }

    const symbol = stock.toUpperCase();
    const price = await getStockPrice(symbol);

    res.json({
      stock: symbol,
      price: Math.round(price * 100) / 100,
      likes: 0 // In a real implementation, this would track likes
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/stock-prices
app.post('/api/stock-prices', async (req, res) => {
  try {
    const { stock, like } = req.body;

    if (!stock) {
      return res.json({ error: 'Stock symbol is required' });
    }

    const symbol = stock.toUpperCase();
    const price = await getStockPrice(symbol);

    // In a real implementation, you would:
    // 1. Check if user is authenticated
    // 2. Track likes in a database
    // 3. Prevent duplicate likes from the same user

    const likes = like === 'true' ? 1 : 0;

    res.json({
      stock: symbol,
      price: Math.round(price * 100) / 100,
      likes
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stock-prices/compare
app.get('/api/stock-prices/compare', async (req, res) => {
  try {
    const { stock1, stock2 } = req.query;

    if (!stock1 || !stock2) {
      return res.json({ error: 'Two stock symbols are required for comparison' });
    }

    const symbol1 = stock1.toUpperCase();
    const symbol2 = stock2.toUpperCase();

    const [price1, price2] = await Promise.all([
      getStockPrice(symbol1),
      getStockPrice(symbol2)
    ]);

    const stockData1 = {
      stock: symbol1,
      price: Math.round(price1 * 100) / 100,
      rel_likes: 0
    };

    const stockData2 = {
      stock: symbol2,
      price: Math.round(price2 * 100) / 100,
      rel_likes: 0
    };

    res.json([stockData1, stockData2]);

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Stock Price Checker API listening on port ${port}`);
});

module.exports = app;
