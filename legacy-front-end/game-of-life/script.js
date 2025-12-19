// Conway's Game of Life
const ROWS = 30;
const COLS = 30;
let grid = [];
let isRunning = false;
let generation = 0;
let population = 0;
let intervalId = null;

// DOM Elements
const gridElement = document.getElementById('grid');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const stepBtn = document.getElementById('stepBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const generationCounter = document.getElementById('generationCounter');
const populationCounter = document.getElementById('populationCounter');

// Preset buttons
const gliderBtn = document.getElementById('gliderBtn');
const beaconBtn = document.getElementById('beaconBtn');
const pulsarBtn = document.getElementById('pulsarBtn');
const gosperBtn = document.getElementById('gosperBtn');
const toadBtn = document.getElementById('toadBtn');
const blinkerBtn = document.getElementById('blinkerBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeGrid();
    setupEventListeners();
    randomizeGrid();
    updateDisplay();
});

// Initialize the grid
function initializeGrid() {
    grid = [];
    gridElement.innerHTML = '';

    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = false;

            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => toggleCell(row, col));
            gridElement.appendChild(cell);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    stopBtn.addEventListener('click', stopGame);
    stepBtn.addEventListener('click', step);
    clearBtn.addEventListener('click', clearGrid);
    randomBtn.addEventListener('click', randomizeGrid);

    // Preset buttons
    gliderBtn.addEventListener('click', () => loadPreset(gliderPattern, 10, 10));
    beaconBtn.addEventListener('click', () => loadPreset(beaconPattern, 10, 10));
    pulsarBtn.addEventListener('click', () => loadPreset(pulsarPattern, 5, 5));
    gosperBtn.addEventListener('click', () => loadPreset(gosperGliderGun, 5, 5));
    toadBtn.addEventListener('click', () => loadPreset(toadPattern, 10, 10));
    blinkerBtn.addEventListener('click', () => loadPreset(blinkerPattern, 10, 10));
}

// Game control functions
function startGame() {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    stepBtn.disabled = true;

    intervalId = setInterval(() => {
        step();
    }, 200); // Update every 200ms
}

function stopGame() {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(intervalId);

    startBtn.disabled = false;
    stopBtn.disabled = true;
    stepBtn.disabled = false;
}

function step() {
    const newGrid = [];

    // Initialize new grid
    for (let row = 0; row < ROWS; row++) {
        newGrid[row] = [];
        for (let col = 0; col < COLS; col++) {
            newGrid[row][col] = false;
        }
    }

    // Apply Game of Life rules
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const neighbors = countNeighbors(row, col);

            if (grid[row][col]) {
                // Live cell
                if (neighbors === 2 || neighbors === 3) {
                    newGrid[row][col] = true; // Survives
                }
                // Otherwise dies (underpopulation or overpopulation)
            } else {
                // Dead cell
                if (neighbors === 3) {
                    newGrid[row][col] = true; // Birth
                }
            }
        }
    }

    // Update grid
    grid = newGrid;
    generation++;
    updateGridDisplay();
    updateDisplay();
}

function countNeighbors(row, col) {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip the cell itself

            const newRow = row + i;
            const newCol = col + j;

            // Check bounds
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (grid[newRow][newCol]) {
                    count++;
                }
            }
        }
    }

    return count;
}

// Cell manipulation functions
function toggleCell(row, col) {
    if (isRunning) return;

    grid[row][col] = !grid[row][col];
    updateGridDisplay();
    updateDisplay();
}

function clearGrid() {
    stopGame();
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = false;
        }
    }
    generation = 0;
    updateGridDisplay();
    updateDisplay();
}

function randomizeGrid() {
    stopGame();
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = Math.random() > 0.7; // 30% chance of being alive
        }
    }
    generation = 0;
    updateGridDisplay();
    updateDisplay();
}

// Preset patterns
function loadPreset(pattern, startRow, startCol) {
    stopGame();
    clearGrid();

    for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
            if (pattern[i][j]) {
                const row = startRow + i;
                const col = startCol + j;
                if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                    grid[row][col] = true;
                }
            }
        }
    }

    updateGridDisplay();
    updateDisplay();
}

// Pattern definitions
const gliderPattern = [
    [false, true, false],
    [false, false, true],
    [true, true, true]
];

const beaconPattern = [
    [true, true, false, false],
    [true, true, false, false],
    [false, false, true, true],
    [false, false, true, true]
];

const pulsarPattern = [
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false]
];

const gosperGliderGun = [
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, true, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, true, true],
    [true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [true, true, false, false, false, false, false, false, false, false, true, false, false, false, true, false, true, true, false, false, false, false, true, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
];

const toadPattern = [
    [false, true, true, true],
    [true, true, true, false]
];

const blinkerPattern = [
    [true],
    [true],
    [true]
];

// Display functions
function updateGridDisplay() {
    const cells = gridElement.children;
    population = 0;

    for (let i = 0; i < cells.length; i++) {
        const row = Math.floor(i / COLS);
        const col = i % COLS;

        if (grid[row][col]) {
            cells[i].classList.add('alive');
            population++;
        } else {
            cells[i].classList.remove('alive');
        }
    }
}

function updateDisplay() {
    generationCounter.textContent = generation;
    populationCounter.textContent = population;
}
