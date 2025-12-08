const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Basic Configuration
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

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
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
const users = new Map();
const games = new Map();
let gameIdCounter = 1;

// Game state management
class Game {
  constructor(id, player1) {
    this.id = id;
    this.players = [player1];
    this.state = 'waiting'; // waiting, playing, finished
    this.board = Array(9).fill(null); // Tic-tac-toe board
    this.currentPlayer = 0;
    this.winner = null;
    this.moves = [];
  }

  addPlayer(player2) {
    if (this.players.length < 2) {
      this.players.push(player2);
      this.state = 'playing';
      return true;
    }
    return false;
  }

  makeMove(playerIndex, position) {
    if (this.state !== 'playing' || this.currentPlayer !== playerIndex ||
        this.board[position] !== null) {
      return false;
    }

    const symbol = playerIndex === 0 ? 'X' : 'O';
    this.board[position] = symbol;
    this.moves.push({ player: playerIndex, position, symbol });

    // Check for winner
    if (this.checkWinner()) {
      this.winner = playerIndex;
      this.state = 'finished';
    } else if (this.board.every(cell => cell !== null)) {
      this.state = 'finished'; // Draw
    } else {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    return true;
  }

  checkWinner() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winPatterns.some(pattern => {
      const [a, b, c] = pattern;
      return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
    });
  }

  getGameState() {
    return {
      id: this.id,
      players: this.players,
      state: this.state,
      board: this.board,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      moves: this.moves
    };
  }
}

// Middleware to verify JWT tokens for socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Secure Real Time Multiplayer Game API');
});

// POST /api/register - User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (users.has(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user
    users.set(username, {
      id: Date.now(),
      username,
      password: hashedPassword,
      createdAt: new Date()
    });

    res.json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.username} connected`);

  // Join game lobby
  socket.on('join-lobby', () => {
    socket.join('lobby');
    socket.emit('lobby-joined', { message: 'Joined game lobby' });
  });

  // Create new game
  socket.on('create-game', () => {
    const gameId = gameIdCounter++;
    const game = new Game(gameId, socket.username);
    games.set(gameId, game);

    socket.gameId = gameId;
    socket.join(`game-${gameId}`);

    socket.emit('game-created', {
      gameId,
      gameState: game.getGameState()
    });

    // Notify lobby
    io.to('lobby').emit('game-available', {
      gameId,
      host: socket.username
    });
  });

  // Join existing game
  socket.on('join-game', (data) => {
    const { gameId } = data;
    const game = games.get(gameId);

    if (!game || game.players.length >= 2 || game.state !== 'waiting') {
      socket.emit('join-failed', { message: 'Cannot join this game' });
      return;
    }

    if (game.addPlayer(socket.username)) {
      socket.gameId = gameId;
      socket.join(`game-${gameId}`);

      // Notify both players
      io.to(`game-${gameId}`).emit('game-started', {
        gameId,
        gameState: game.getGameState()
      });

      // Remove from available games
      io.to('lobby').emit('game-removed', { gameId });
    }
  });

  // Make a move
  socket.on('make-move', (data) => {
    const { gameId, position } = data;
    const game = games.get(gameId);

    if (!game || game.state !== 'playing') {
      socket.emit('move-invalid', { message: 'Invalid move' });
      return;
    }

    const playerIndex = game.players.indexOf(socket.username);
    if (playerIndex === -1) {
      socket.emit('move-invalid', { message: 'Not a player in this game' });
      return;
    }

    if (game.makeMove(playerIndex, position)) {
      // Notify all players in the game
      io.to(`game-${gameId}`).emit('move-made', {
        gameState: game.getGameState(),
        move: { player: playerIndex, position, symbol: playerIndex === 0 ? 'X' : 'O' }
      });

      // If game is finished, clean up
      if (game.state === 'finished') {
        setTimeout(() => {
          games.delete(gameId);
        }, 5000); // Keep game state for 5 seconds
      }
    } else {
      socket.emit('move-invalid', { message: 'Invalid move' });
    }
  });

  // Send message in game chat
  socket.on('send-message', (data) => {
    const { gameId, message } = data;

    if (socket.gameId === gameId) {
      // Sanitize message (basic)
      const cleanMessage = message.replace(/<[^>]*>/g, '').substring(0, 200);

      io.to(`game-${gameId}`).emit('message-received', {
        username: socket.username,
        message: cleanMessage,
        timestamp: new Date()
      });
    }
  });

  // Leave game
  socket.on('leave-game', () => {
    if (socket.gameId) {
      const game = games.get(socket.gameId);
      if (game) {
        // Remove player from game
        const playerIndex = game.players.indexOf(socket.username);
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1);
          if (game.players.length === 0) {
            games.delete(socket.gameId);
          } else {
            game.state = 'finished';
            game.winner = game.players.length === 1 ? 0 : null;
          }
        }

        socket.leave(`game-${socket.gameId}`);
        socket.gameId = null;

        // Notify remaining players
        if (game && game.players.length > 0) {
          io.to(`game-${socket.gameId}`).emit('player-left', {
            username: socket.username,
            gameState: game.getGameState()
          });
        }
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.username} disconnected`);

    // Handle disconnection (similar to leave-game)
    if (socket.gameId) {
      const game = games.get(socket.gameId);
      if (game) {
        const playerIndex = game.players.indexOf(socket.username);
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1);
          if (game.players.length === 0) {
            games.delete(socket.gameId);
          }
        }
      }
    }
  });
});

// Start server
server.listen(port, () => {
  console.log(`Secure Real Time Multiplayer Game listening on port ${port}`);
});

module.exports = app;
