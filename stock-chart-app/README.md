# Stock Market Chart App

A web application for visualizing stock market data with interactive charts. Displays historical stock prices and information for various symbols.

## Features

- Search for stocks by symbol
- Interactive price charts using Chart.js
- Display current stock information (open, high, low, close, volume)
- Real-time data fetching from Alpha Vantage API
- Mock data support for demonstration

## Technologies Used

- **Backend**: Node.js, Express.js, Axios
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Data Source**: Alpha Vantage API (with mock data fallback)

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/stockchart
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   PORT=3003
   ```

   Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)

3. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Access the application:**
   Open `http://localhost:3003` in your browser

## API Endpoints

- `GET /` - Main application page
- `GET /api/stock/:symbol` - Get stock data for a symbol

## Note on API Integration

This implementation uses the Alpha Vantage API for real stock data. If no API key is provided, it falls back to generating mock data for demonstration purposes.

## Chart Features

- Line chart showing closing prices over time
- Responsive design
- Interactive tooltips
- Clean, professional styling

## FreeCodeCamp Certification

This implementation fulfills the requirements for the "Chart the Stock Market" project in the FreeCodeCamp Back End Development and APIs certification.
