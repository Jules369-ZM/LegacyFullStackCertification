# Legacy Front End Projects

This directory contains additional FreeCodeCamp front-end projects that demonstrate various JavaScript and API integration skills.

## Projects Implemented

### 1. Local Weather App (`local-weather/`)
- **Description**: Real-time weather application using geolocation and weather APIs
- **Features**:
  - Automatic location detection using GPS
  - IP-based location fallback
  - Real-time weather data from OpenWeatherMap API
  - Temperature unit conversion (°C/°F)
  - Weather icons and detailed information
  - Responsive design with loading states
  - Error handling for location/API failures

### 2. TwitchTV JSON API (`twitchtv-api/`)
- **Description**: Streamer status display using API concepts (mock implementation)
- **Features**:
  - Mock API data simulation for Twitch streams
  - Online/offline status filtering
  - Streamer information display (name, game, viewers)
  - Responsive card-based layout
  - Loading states and error handling
  - Real-time filtering functionality

### 3. Wikipedia Viewer (`wikipedia-viewer/`)
- **Description**: Search interface for Wikipedia articles using their public API
- **Features**:
  - Real-time search with Wikipedia's search API
  - Article summaries and thumbnails
  - Random article functionality
  - Responsive design with loading states
  - Direct links to full Wikipedia articles
  - Error handling for API failures

### 4. Tic Tac Toe Game (`tic-tac-toe/`)
- **Description**: Classic 3x3 grid game for two players with scoring
- **Features**:
  - Two-player turn-based gameplay
  - Win detection for all combinations
  - Score tracking and high scores
  - Visual win highlighting
  - Responsive design
  - Game reset and score reset functionality

### 5. Memory Light Game (`memory-game/`)
- **Description**: Simon Says style memory challenge with colored lights
- **Features**:
  - Progressive sequence memorization
  - Four colored buttons with visual feedback
  - Increasing difficulty levels
  - Score tracking with persistent high scores
  - Keyboard controls (R, B, G, Y)
  - Game over modal with statistics

## Technologies Used

- **Vanilla JavaScript**: DOM manipulation, async/await, fetch API
- **HTML5 Geolocation**: User location detection
- **OpenWeatherMap API**: Weather data retrieval
- **Font Awesome**: Weather icons and UI elements
- **CSS3**: Responsive design, animations, modern styling
- **IP Geolocation API**: Fallback location detection

## Features Demonstrated

### Local Weather App
- **Geolocation API**: Requesting user location permissions
- **Async/Await**: Modern JavaScript asynchronous programming
- **API Integration**: RESTful API consumption with error handling
- **Fallback Mechanisms**: Multiple location detection methods
- **User Experience**: Loading states, error messages, smooth transitions
- **Data Visualization**: Weather icons, temperature formatting
- **Responsive Design**: Mobile-first approach with media queries

### TwitchTV JSON API
- **Mock API Implementation**: Simulating real API calls with structured data
- **Data Filtering**: Dynamic content filtering based on user selection
- **State Management**: Managing application state for different views
- **Error Handling**: Graceful error handling with user feedback
- **Modern UI/UX**: Glassmorphism design with smooth animations
- **Responsive Layout**: Adaptive design for different screen sizes

### Wikipedia Viewer
- **External API Integration**: Real-time data fetching from Wikipedia APIs
- **Search Functionality**: Dynamic search with debouncing and error handling
- **Content Display**: Rich content presentation with images and links
- **User Experience**: Loading states, welcome messages, and smooth transitions
- **Accessibility**: Keyboard navigation and screen reader support
- **Progressive Enhancement**: Graceful degradation and error recovery

### Tic Tac Toe Game
- **Game Logic**: Complex win condition checking and game state management
- **Interactive UI**: Dynamic user interface updates and visual feedback
- **Score Persistence**: Local storage for high scores and game statistics
- **Animation System**: Smooth transitions and win highlighting
- **Event Handling**: Comprehensive event management and user interactions
- **Algorithm Implementation**: Game theory and state validation algorithms

### Memory Light Game
- **Sequence Generation**: Random sequence creation with increasing complexity
- **Timing Controls**: Precise timing for sequence playback and user input
- **Progressive Difficulty**: Dynamic difficulty scaling based on performance
- **Visual Feedback**: Color animations and interactive button states
- **Score Management**: Persistent high score tracking with localStorage
- **Input Validation**: Real-time input validation and error detection

## Installation and Setup

Each project is self-contained and can be run by opening the `index.html` file in a web browser. The Local Weather app requires:

1. **API Key**: Uses OpenWeatherMap API (key included for demo)
2. **HTTPS**: Geolocation requires secure connection in production
3. **Location Permissions**: Browser permission for GPS access

## FreeCodeCamp Legacy Curriculum

These projects fulfill requirements from the legacy FreeCodeCamp front-end curriculum, demonstrating:

- **Intermediate Algorithm Scripting**
- **JSON APIs and Ajax**
- **Front End Development Libraries** (additional practice)
- **Data Visualization** (additional practice)

## Project Status

- ✅ **Local Weather App** - Completed
- ✅ **TwitchTV JSON API** - Completed
- ✅ **Wikipedia Viewer** - Completed
- ✅ **Tic Tac Toe Game** - Completed
- ✅ **Memory Light Game** - Completed

**Legacy Front End projects: 5/5 completed** 🎨
