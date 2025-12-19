// Tic Tac Toe Game Logic - Human vs Computer

const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

let humanPlayer = null;
let computerPlayer = null;
let currentPlayer = null;
let gameActive = false;
let gameState = Array(9).fill(null);
let scores = { x: 0, o: 0, ties: 0 };

const gameBoard = document.getElementById('gameBoard');
const currentPlayerText = document.getElementById('currentPlayerText');
const messageText = document.getElementById('messageText');
const gameMessage = document.getElementById('gameMessage');
const xScoreElement = document.getElementById('xScore');
const oScoreElement = document.getElementById('oScore');
const tiesScoreElement = document.getElementById('tiesScore');
const playerSelection = document.getElementById('playerSelection');
const gameInfo = document.getElementById('gameInfo');

document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    setupEventListeners();
    updateScoreDisplay();
}

function setupEventListeners() {
    // Player selection events
    document.querySelectorAll('.symbol-btn').forEach(button => {
        button.addEventListener('click', handlePlayerSelection);
    });

    // Cell click events
    document.querySelectorAll('[data-cell]').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Button events
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('resetScoreBtn').addEventListener('click', resetScores);
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
}

function handlePlayerSelection(e) {
    const selectedSymbol = e.target.dataset.symbol;
    humanPlayer = selectedSymbol;
    computerPlayer = selectedSymbol === X_CLASS ? O_CLASS : X_CLASS;

    // Hide player selection and show game
    playerSelection.style.display = 'none';
    gameInfo.style.display = 'block';

    // Start new game
    startNewGame();
}

function startNewGame() {
    currentPlayer = X_CLASS; // X always starts
    gameActive = true;
    gameState = Array(9).fill(null);

    document.querySelectorAll('[data-cell]').forEach(cell => {
        cell.classList.remove(X_CLASS, O_CLASS);
        cell.style.backgroundColor = '';
        cell.style.color = '';
    });

    updateCurrentPlayerDisplay();
    hideGameMessage();

    // If computer goes first (when human chose O), make computer move
    if (humanPlayer === O_CLASS && currentPlayer === computerPlayer) {
        setTimeout(makeComputerMove, 500);
    }
}

function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(gameBoard.children).indexOf(cell);

    if (!gameActive || gameState[cellIndex] !== null || currentPlayer !== humanPlayer) {
        return;
    }

    makeMove(cell, cellIndex, humanPlayer);

    if (checkWin(humanPlayer)) {
        endGame(false, humanPlayer);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        // Computer's turn
        currentPlayer = computerPlayer;
        updateCurrentPlayerDisplay();
        setTimeout(makeComputerMove, 500);
    }
}

function makeComputerMove() {
    if (!gameActive) return;

    const bestMove = getBestMove();
    const cell = document.querySelectorAll('[data-cell]')[bestMove];

    makeMove(cell, bestMove, computerPlayer);

    if (checkWin(computerPlayer)) {
        endGame(false, computerPlayer);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        // Human's turn
        currentPlayer = humanPlayer;
        updateCurrentPlayerDisplay();
    }
}

function getBestMove() {
    // Simple AI: try to win, block human win, or play randomly
    let availableMoves = [];
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === null) {
            availableMoves.push(i);
        }
    }

    // Try to win
    for (let move of availableMoves) {
        gameState[move] = computerPlayer;
        if (checkWin(computerPlayer)) {
            gameState[move] = null;
            return move;
        }
        gameState[move] = null;
    }

    // Try to block human win
    for (let move of availableMoves) {
        gameState[move] = humanPlayer;
        if (checkWin(humanPlayer)) {
            gameState[move] = null;
            return move;
        }
        gameState[move] = null;
    }

    // Take center if available
    if (availableMoves.includes(4)) {
        return 4;
    }

    // Take corners if available
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (availableMoves.includes(corner)) {
            return corner;
        }
    }

    // Random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function makeMove(cell, index, player) {
    gameState[index] = player;
    cell.classList.add(player);

    // Add animation
    cell.style.animation = 'pop 0.3s ease';
    setTimeout(() => {
        cell.style.animation = '';
    }, 300);
}

function checkWin(player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return gameState[index] === player;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== null);
}

function endGame(draw, winner = null) {
    gameActive = false;

    if (draw) {
        messageText.textContent = "It's a Tie!";
        scores.ties++;
    } else {
        const winnerSymbol = winner === X_CLASS ? 'X' : 'O';
        const isHumanWinner = winner === humanPlayer;
        messageText.textContent = isHumanWinner ? `You Win!` : `Computer Wins!`;
        scores[winner]++;
    }

    updateScoreDisplay();
    showGameMessage();

    // Auto-reset after 2 seconds
    setTimeout(() => {
        playAgain();
    }, 2000);
}

function updateCurrentPlayerDisplay() {
    if (currentPlayer === humanPlayer) {
        currentPlayerText.textContent = "Your turn";
    } else {
        currentPlayerText.textContent = "Computer's turn";
    }
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
    startNewGame();
}

function resetScores() {
    scores = { x: 0, o: 0, ties: 0 };
    updateScoreDisplay();
    startNewGame();
}

function playAgain() {
    startNewGame();
}
