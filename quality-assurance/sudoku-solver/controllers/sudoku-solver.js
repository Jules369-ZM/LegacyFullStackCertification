class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) {
      return { error: 'Required field missing' };
    }
    if (puzzleString.length !== 81) {
      return { error: 'Expected puzzle to be 81 characters long' };
    }
    if (/[^1-9.]/.test(puzzleString)) {
      return { error: 'Invalid characters in puzzle' };
    }
    return true;
  }

  // row: letter 'A'-'I', column: number 1-9 (or string '1'-'9')
  checkRowPlacement(puzzleString, row, column, value) {
    const rowIndex = row.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const colIndex = parseInt(column) - 1;
    const rowStart = rowIndex * 9;

    for (let c = 0; c < 9; c++) {
      if (c === colIndex) continue; // skip the cell we're placing into
      if (puzzleString[rowStart + c] === String(value)) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const rowIndex = row.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const colIndex = parseInt(column) - 1;

    for (let r = 0; r < 9; r++) {
      if (r === rowIndex) continue; // skip the cell we're placing into
      if (puzzleString[r * 9 + colIndex] === String(value)) {
        return false;
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const rowIndex = row.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const colIndex = parseInt(column) - 1;

    const regionRowStart = Math.floor(rowIndex / 3) * 3;
    const regionColStart = Math.floor(colIndex / 3) * 3;

    for (let r = regionRowStart; r < regionRowStart + 3; r++) {
      for (let c = regionColStart; c < regionColStart + 3; c++) {
        if (r === rowIndex && c === colIndex) continue; // skip the cell we're placing into
        if (puzzleString[r * 9 + c] === String(value)) {
          return false;
        }
      }
    }
    return true;
  }

  solve(puzzleString) {
    const validation = this.validate(puzzleString);
    if (validation !== true) {
      return validation;
    }

    const result = this._backtrack(puzzleString.split(''));
    if (!result) {
      return { error: 'Puzzle cannot be solved' };
    }
    return { solution: result.join('') };
  }

  _backtrack(board) {
    // Find the first empty cell
    const emptyIndex = board.indexOf('.');
    if (emptyIndex === -1) {
      // No empty cells — puzzle is solved
      return board;
    }

    const rowIndex = Math.floor(emptyIndex / 9);
    const colIndex = emptyIndex % 9;
    const rowLetter = String.fromCharCode('A'.charCodeAt(0) + rowIndex);
    const colNumber = colIndex + 1;

    for (let val = 1; val <= 9; val++) {
      const strVal = String(val);
      if (
        this.checkRowPlacement(board.join(''), rowLetter, colNumber, strVal) &&
        this.checkColPlacement(board.join(''), rowLetter, colNumber, strVal) &&
        this.checkRegionPlacement(board.join(''), rowLetter, colNumber, strVal)
      ) {
        board[emptyIndex] = strVal;
        const result = this._backtrack(board);
        if (result) return result;
        board[emptyIndex] = '.'; // backtrack
      }
    }

    return null; // no valid value found, trigger backtrack
  }
}

module.exports = SudokuSolver;
