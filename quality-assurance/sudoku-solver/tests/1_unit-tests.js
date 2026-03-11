const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

// Sample puzzle and solution from puzzle-strings.js
const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const validSolution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

suite('Unit Tests', () => {

  // 1. Logic handles a valid puzzle string of 81 characters
  test('Logic handles a valid puzzle string of 81 characters', () => {
    assert.equal(solver.validate(validPuzzle), true);
  });

  // 2. Logic handles a puzzle string with invalid characters (not 1-9 or .)
  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const invalidPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37X';
    const result = solver.validate(invalidPuzzle);
    assert.isObject(result);
    assert.equal(result.error, 'Invalid characters in puzzle');
  });

  // 3. Logic handles a puzzle string that is not 81 characters in length
  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const shortPuzzle = '1.5..2.84..63.12.7';
    const result = solver.validate(shortPuzzle);
    assert.isObject(result);
    assert.equal(result.error, 'Expected puzzle to be 81 characters long');
  });

  // 4. Logic handles a valid row placement
  test('Logic handles a valid row placement', () => {
    // Row A: '1.5..2.84' — placing '3' at A2 (no 3 in row A)
    assert.equal(solver.checkRowPlacement(validPuzzle, 'A', '2', '3'), true);
  });

  // 5. Logic handles an invalid row placement
  test('Logic handles an invalid row placement', () => {
    // Row A: '1.5..2.84' — placing '1' at A2 (1 already exists in row A)
    assert.equal(solver.checkRowPlacement(validPuzzle, 'A', '2', '1'), false);
  });

  // 6. Logic handles a valid column placement
  test('Logic handles a valid column placement', () => {
    // Column 1: 1,.,.,.,8,.,4,1,9 → actually checking col 2
    // Column 2 values: '.','.','.','.','.','.','.','.',2 → placing '3' at A2 is valid
    assert.equal(solver.checkColPlacement(validPuzzle, 'A', '2', '3'), true);
  });

  // 7. Logic handles an invalid column placement
  test('Logic handles an invalid column placement', () => {
    // Column 1: row A=1, so placing '1' at B1 should be invalid
    assert.equal(solver.checkColPlacement(validPuzzle, 'B', '1', '1'), false);
  });

  // 8. Logic handles a valid region (3x3 grid) placement
  test('Logic handles a valid region (3x3 grid) placement', () => {
    // Top-left region (rows A-C, cols 1-3): '1', '.', '5', '.', '.', '6', '3', '.', '1' → wait
    // Puzzle: 1.5..2.84 / ..63.12.7 / .2..5....
    // Top-left region cells: A1=1, A2=., A3=5, B1=., B2=., B3=6, C1=., C2=2, C3=.
    // Placing '3' at A2 in top-left region — no 3 in region, valid
    assert.equal(solver.checkRegionPlacement(validPuzzle, 'A', '2', '3'), true);
  });

  // 9. Logic handles an invalid region (3x3 grid) placement
  test('Logic handles an invalid region (3x3 grid) placement', () => {
    // Top-left region contains '1' (at A1), so placing '1' at A2 should be invalid
    assert.equal(solver.checkRegionPlacement(validPuzzle, 'A', '2', '1'), false);
  });

  // 10. Valid puzzle strings pass the solver
  test('Valid puzzle strings pass the solver', () => {
    const result = solver.solve(validPuzzle);
    assert.isObject(result);
    assert.property(result, 'solution');
  });

  // 11. Invalid puzzle strings fail the solver
  test('Invalid puzzle strings fail the solver', () => {
    const invalidPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37X';
    const result = solver.solve(invalidPuzzle);
    assert.isObject(result);
    assert.property(result, 'error');
  });

  // 12. Solver returns the expected solution for an incomplete puzzle
  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const result = solver.solve(validPuzzle);
    assert.isObject(result);
    assert.equal(result.solution, validSolution);
  });

});
