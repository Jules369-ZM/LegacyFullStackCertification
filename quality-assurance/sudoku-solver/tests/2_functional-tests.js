const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const validSolution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

suite('Functional Tests', () => {

  suite('POST /api/solve', () => {

    // 1. Solve a puzzle with valid puzzle string
    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: validPuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.solution, validSolution);
          done();
        });
    });

    // 2. Solve a puzzle with missing puzzle string
    test('Solve a puzzle with missing puzzle string: POST request to /api/solve', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Required field missing');
          done();
        });
    });

    // 3. Solve a puzzle with invalid characters
    test('Solve a puzzle with invalid characters: POST request to /api/solve', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37X' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });

    // 4. Solve a puzzle with incorrect length
    test('Solve a puzzle with incorrect length: POST request to /api/solve', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: '1.5..2.84..63.12.7' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    // 5. Solve a puzzle that cannot be solved
    test('Solve a puzzle that cannot be solved: POST request to /api/solve', (done) => {
      // Two 1s in the same row make it unsolvable
      const unsolvable = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: unsolvable })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Puzzle cannot be solved');
          done();
        });
    });

  });

  suite('POST /api/check', () => {

    // 6. Check a puzzle placement with all fields
    test('Check a puzzle placement with all fields: POST request to /api/check', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '3' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.valid, true);
          done();
        });
    });

    // 7. Check a puzzle placement with single placement conflict
    test('Check a puzzle placement with single placement conflict: POST request to /api/check', (done) => {
      // Row A: 1.5..2.84 — has '8' at A8. Col 2 has no '8'. Top-left region has no '8'.
      // Placing '8' at A2 conflicts only with the row → exactly 1 conflict
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '8' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.valid, false);
          assert.isArray(res.body.conflict);
          assert.equal(res.body.conflict.length, 1);
          done();
        });
    });

    // 8. Check a puzzle placement with multiple placement conflicts
    test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', (done) => {
      // '2' at B2: Row B has '2' (B6=2 in puzzle row B: ..63.12.7 → B6=1,B7=2), and check column/region
      // Using puzzle row B = ..63.12.7 — B7=2
      // Column 2: check what's there. Let's use a placement that conflicts with 2 constraints
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '5' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.valid, false);
          assert.isArray(res.body.conflict);
          assert.isAtLeast(res.body.conflict.length, 2);
          done();
        });
    });

    // 9. Check a puzzle placement with all placement conflicts
    test('Check a puzzle placement with all placement conflicts: POST request to /api/check', (done) => {
      // Place a value that conflicts in row, column, AND region:
      // Row E: '8.2.3674.' → has '2' at E3 → row conflict
      // Col 2: A2=., B2=., C2=2, D2=9, ... → has '2' at C2 → col conflict
      // Middle-left region (rows D-F, cols 1-3): D1=., D2=9, D3=., E1=8, E3=2, F1=3, F2=., F3=7 → has '2' at E3 → region conflict
      // Placing '2' at E2 conflicts in all three: row, column, region
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'E2', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.valid, false);
          assert.isArray(res.body.conflict);
          assert.equal(res.body.conflict.length, 3);
          done();
        });
    });

    // 10. Check a puzzle placement with missing required fields
    test('Check a puzzle placement with missing required fields: POST request to /api/check', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2' }) // missing value
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Required field(s) missing');
          done();
        });
    });

    // 11. Check a puzzle placement with invalid characters
    test('Check a puzzle placement with invalid characters: POST request to /api/check', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37X', coordinate: 'A2', value: '3' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });

    // 12. Check a puzzle placement with incorrect length
    test('Check a puzzle placement with incorrect length: POST request to /api/check', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: '1.5..2.84', coordinate: 'A2', value: '3' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    // 13. Check a puzzle placement with invalid placement coordinate
    test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'Z9', value: '3' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Invalid coordinate');
          done();
        });
    });

    // 14. Check a puzzle placement with invalid placement value
    test('Check a puzzle placement with invalid placement value: POST request to /api/check', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '0' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.error, 'Invalid value');
          done();
        });
    });

  });

});
