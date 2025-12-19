# Stock Market Chart App

A real-time collaborative stock market visualization application. Multiple users can add and remove stock symbols to view interactive charts that update instantly across all connected users using WebSockets.

## Features

- **Real-time Collaboration** - See changes instantly when other users add/remove stocks
- **Multiple Stock Tracking** - View multiple stock charts simultaneously
- **Interactive Charts** - Beautiful line charts with price trends using Chart.js
- **Stock Statistics** - Current price, daily change, high/low values
- **WebSocket Integration** - Live updates across all connected users
- **Responsive Design** - Works on desktop and mobile devices
- **Alpha Vantage API** - Real stock market data with mock data fallback

## User Stories Implemented

✅ **You can view a graph displaying the recent trend lines for each added stock.**
- Interactive line charts showing 30 days of price data
- Multiple stocks displayed in a responsive grid layout
- Hover tooltips with precise price information

✅ **You can add new stocks by their symbol name.**
- Simple input field to add stock symbols (AAPL, GOOGL, MSFT, etc.)
- Validation to prevent duplicate stocks
- Real-time API validation using Alpha Vantage

✅ **You can remove stocks.**
- Remove button on each stock chart
- Confirmation dialog to prevent accidental removal
- Clean UI updates with animations

✅ **You can see changes in real-time when any other user adds or removes a stock.**
- WebSocket connections for instant synchronization
- Notifications when other users add/remove stocks
- Shared state across all connected users

## Technologies Used

- **Backend**: Node.js, Express.js, Socket.IO, Axios, MongoDB
- **Frontend**: HTML, CSS, JavaScript, Chart.js, Socket.IO client
- **Real-time**: WebSocket communication with Socket.IO
- **Data Source**: Alpha Vantage API (with mock data fallback)
- **Database**: MongoDB for session storage

## Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Alpha Vantage API:**
   - Sign up at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Get your free API key

3. **Environment Variables:**
   Create a `.env` file with:
   ```
   MONGO_URI=mongodb://localhost:27017/stockchart
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   PORT=3003
   ```

4. **Start MongoDB (optional):**
   MongoDB is optional for basic functionality, but recommended for production.

5. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Access the application:**
   Open `http://localhost:3003` in your browser

## API Endpoints

- `GET /` - Main application page
- `GET /api/stocks` - Get list of currently tracked stocks
- `POST /api/stocks` - Add a new stock to track
- `DELETE /api/stocks/:symbol` - Remove a stock from tracking
- `GET /api/stock/:symbol` - Get detailed stock data for charting

## Architecture

```
stock-chart-app/
├── server.js           # Express server with Socket.IO & Alpha Vantage API
├── public/
│   ├── index.html      # Main stock tracking interface
│   ├── script.js       # Frontend logic with WebSocket & Chart.js
│   └── styles.css      # Modern responsive styling
├── package.json        # Dependencies & scripts
├── .env               # Environment configuration
└── README.md          # Complete documentation
```

## Key Features

### Real-time Collaboration
- **WebSocket Communication**: Instant updates when users add/remove stocks
- **Live Notifications**: Toast notifications for user actions
- **Shared State**: All users see the same stock charts simultaneously

### Stock Data Visualization
- **Interactive Charts**: Chart.js powered line graphs with hover details
- **Multiple Stocks**: Grid layout supporting multiple simultaneous charts
- **Price Statistics**: Current price, daily change percentage, high/low values
- **Responsive Design**: Adapts to different screen sizes

### Stock Management
- **Easy Addition**: Simple text input with validation
- **Duplicate Prevention**: Can't add the same stock twice
- **Clean Removal**: Confirmation dialogs and smooth animations
- **Example Stocks**: Quick-add buttons for popular stocks

## Real-time Synchronization

The app uses Socket.IO to maintain real-time synchronization across all connected users:

- When a user adds a stock, all other users instantly see the new chart
- When a user removes a stock, it disappears for everyone simultaneously
- Notifications inform users about actions taken by others
- No page refresh required - everything updates automatically

## FreeCodeCamp Certification

This implementation fulfills all requirements for the "Chart the Stock Market" project in the FreeCodeCamp Back End Development and APIs certification.

**Solution Link:** http://localhost:3003
**Source Code Link:** https://github.com/Jules369-ZM/LegacyFullStackCertification
