const express = require('express');
const cors = require('cors');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Sudoku solver function
function solveSudoku(board) {
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) return true; // Puzzle solved

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;

      if (solveSudoku(board)) {
        return true;
      }

      board[row][col] = 0; // Backtrack
    }
  }

  return false;
}

function findEmptyCell(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

function isValid(board, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

function validatePuzzle(puzzleString) {
  if (puzzleString.length !== 81) {
    return { error: 'Expected puzzle to be 81 characters long' };
  }

  if (!/^[0-9.]+$/.test(puzzleString)) {
    return { error: 'Invalid characters in puzzle' };
  }

  return null;
}

// Routes
app.get('/', (req, res) => {
  res.send('Sudoku Solver API');
});

// POST /api/solve
app.post('/api/solve', (req, res) => {
  const { puzzle } = req.body;

  if (!puzzle) {
    return res.json({ error: 'Required field missing' });
  }

  const validation = validatePuzzle(puzzle);
  if (validation) {
    return res.json(validation);
  }

  // Convert string to 2D array
  const board = [];
  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      const char = puzzle[i * 9 + j];
      board[i][j] = char === '.' ? 0 : parseInt(char);
    }
  }

  // Solve the puzzle
  const solved = solveSudoku(board);

  if (!solved) {
    return res.json({ error: 'Puzzle cannot be solved' });
  }

  // Convert back to string
  let solution = '';
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      solution += board[i][j];
    }
  }

  res.json({
    solution: solution
  });
});

// POST /api/check
app.post('/api/check', (req, res) => {
  const { puzzle, coordinate, value } = req.body;

  if (!puzzle || !coordinate || !value) {
    return res.json({ error: 'Required field(s) missing' });
  }

  const validation = validatePuzzle(puzzle);
  if (validation) {
    return res.json(validation);
  }

  // Parse coordinate
  if (!/^[A-I][1-9]$/.test(coordinate)) {
    return res.json({ error: 'Invalid coordinate' });
  }

  const row = coordinate.charCodeAt(0) - 'A'.charCodeAt(0);
  const col = parseInt(coordinate[1]) - 1;
  const num = parseInt(value);

  if (num < 1 || num > 9) {
    return res.json({ error: 'Invalid value' });
  }

  // Convert string to 2D array
  const board = [];
  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      const char = puzzle[i * 9 + j];
      board[i][j] = char === '.' ? 0 : parseInt(char);
    }
  }

  // Check if the position is already filled
  if (board[row][col] !== 0) {
    return res.json({ valid: false, conflict: 'Already filled' });
  }

  // Check validity
  const valid = isValid(board, row, col, num);

  if (valid) {
    return res.json({ valid: true });
  } else {
    // Find conflicts
    const conflict = [];

    // Check row
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) {
        conflict.push('row');
        break;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) {
        conflict.push('column');
        break;
      }
    }

    // Check region
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (board[r][c] === num) {
          conflict.push('region');
          break;
        }
      }
      if (conflict.includes('region')) break;
    }

    return res.json({ valid: false, conflict });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Sudoku Solver API listening on port ${port}`);
});

module.exports = app;
