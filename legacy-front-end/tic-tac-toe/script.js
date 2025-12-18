// Tic Tac Toe Game Logic

const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

let currentPlayer = X_CLASS;
let gameActive = true;
let gameState = Array(9).fill(null);
let scores = { x: 0, o: 0, ties: 0 };

const gameBoard = document.getElementById('gameBoard');
const currentPlayerText = document.getElementById('currentPlayerText');
const messageText = document.getElementById('messageText');
const gameMessage = document.getElementById('gameMessage');
const xScoreElement = document.getElementById('xScore');
const oScoreElement = document.getElementById('oScore');
const tiesScoreElement = document.getElementById('tiesScore');

document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    setupEventListeners();
    updateScoreDisplay();
    updateCurrentPlayerDisplay();
}

function setupEventListeners() {
    // Cell click events
    document.querySelectorAll('[data-cell]').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Button events
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('resetScoreBtn').addEventListener('click', resetScores);
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
}

function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(gameBoard.children).indexOf(cell);

    if (!gameActive || gameState[cellIndex] !== null) {
        return;
    }

    makeMove(cell, cellIndex);

    if (checkWin()) {
        endGame(false);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        switchPlayer();
    }
}

function makeMove(cell, index) {
    gameState[index] = currentPlayer;
    cell.classList.add(currentPlayer);
}

function switchPlayer() {
    currentPlayer = currentPlayer === X_CLASS ? O_CLASS : X_CLASS;
    updateCurrentPlayerDisplay();
}

function checkWin() {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== null);
}

function endGame(draw) {
    gameActive = false;

    if (draw) {
        messageText.textContent = "It's a Tie!";
        scores.ties++;
    } else {
        const winner = currentPlayer === X_CLASS ? 'X' : 'O';
        messageText.textContent = `Player ${winner} Wins!`;
        scores[currentPlayer]++;
    }

    updateScoreDisplay();
    showGameMessage();
}

function updateCurrentPlayerDisplay() {
    const player = currentPlayer === X_CLASS ? 'X' : 'O';
    currentPlayerText.textContent = `Player ${player}'s turn`;
}

function updateScoreDisplay() {
    xScoreElement.textContent = scores.x;
    oScoreElement.textContent = scores.o;
    tiesScoreElement.textContent = scores.ties;
}

function showGameMessage() {
    gameMessage.classList.remove('hidden');
}

function hideGameMessage() {
    gameMessage.classList.add('hidden');
}

function resetGame() {
    currentPlayer = X_CLASS;
    gameActive = true;
    gameState = Array(9).fill(null);

    document.querySelectorAll('[data-cell]').forEach(cell => {
        cell.classList.remove(X_CLASS, O_CLASS);
    });

    updateCurrentPlayerDisplay();
    hideGameMessage();
}

function resetScores() {
    scores = { x: 0, o: 0, ties: 0 };
    updateScoreDisplay();
    resetGame();
}

function playAgain() {
    resetGame();
}

// Add keyboard support for better accessibility
document.addEventListener('keydown', function(event) {
    if (event.key >= '1' && event.key <= '9') {
        const cellIndex = parseInt(event.key) - 1;
        const cell = document.querySelectorAll('[data-cell]')[cellIndex];
        if (cell) {
            cell.click();
        }
    } else if (event.key === 'r' || event.key === 'R') {
        resetGame();
    }
});

// Add visual feedback for winning cells
function highlightWinningCells(combination) {
    combination.forEach(index => {
        const cell = document.querySelectorAll('[data-cell]')[index];
        cell.style.backgroundColor = '#4CAF50';
        cell.style.color = 'white';
    });
}

// Modified endGame to highlight winning cells
function endGame(draw) {
    gameActive = false;

    if (draw) {
        messageText.textContent = "It's a Tie!";
        scores.ties++;
    } else {
        const winner = currentPlayer === X_CLASS ? 'X' : 'O';
        messageText.textContent = `Player ${winner} Wins!`;
        scores[currentPlayer]++;

        // Highlight winning combination
        const winningCombination = WINNING_COMBINATIONS.find(combination => {
            return combination.every(index => gameState[index] === currentPlayer);
        });

        if (winningCombination) {
            setTimeout(() => highlightWinningCells(winningCombination), 500);
        }
    }

    updateScoreDisplay();
    showGameMessage();
}

// Add animation for moves
function makeMove(cell, index) {
    gameState[index] = currentPlayer;
    cell.classList.add(currentPlayer);

    // Add pop animation
    cell.style.animation = 'pop 0.3s ease';
    setTimeout(() => {
        cell.style.animation = '';
    }, 300);
}

// Add CSS animation keyframes (will be added to CSS if needed)
const style = document.createElement('style');
style.textContent = `
    @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);
