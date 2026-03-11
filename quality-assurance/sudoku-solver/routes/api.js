'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      // Check for missing fields
      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      // Validate puzzle string
      const validation = solver.validate(puzzle);
      if (validation !== true) {
        return res.json(validation);
      }

      // Validate coordinate format (letter A-I followed by digit 1-9)
      if (!/^[A-Ia-i][1-9]$/.test(coordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      }

      // Validate value (must be 1-9)
      if (!/^[1-9]$/.test(String(value))) {
        return res.json({ error: 'Invalid value' });
      }

      const row = coordinate[0].toUpperCase();
      const col = coordinate[1];
      const strValue = String(value);

      // Check if the value is already placed at that coordinate
      const rowIndex = row.charCodeAt(0) - 'A'.charCodeAt(0);
      const colIndex = parseInt(col) - 1;
      const cellIndex = rowIndex * 9 + colIndex;

      if (puzzle[cellIndex] === strValue) {
        return res.json({ valid: true });
      }

      // Check placements
      const rowValid = solver.checkRowPlacement(puzzle, row, col, strValue);
      const colValid = solver.checkColPlacement(puzzle, row, col, strValue);
      const regionValid = solver.checkRegionPlacement(puzzle, row, col, strValue);

      if (rowValid && colValid && regionValid) {
        return res.json({ valid: true });
      }

      const conflict = [];
      if (!rowValid) conflict.push('row');
      if (!colValid) conflict.push('column');
      if (!regionValid) conflict.push('region');

      return res.json({ valid: false, conflict });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }

      const result = solver.solve(puzzle);
      return res.json(result);
    });
};
