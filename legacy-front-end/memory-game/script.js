// Memory Light Game - Simon Says Style

const colors = ['red', 'blue', 'green', 'yellow'];
let sequence = [];
let playerSequence = [];
let level = 1;
let score = 0;
let highScore = localStorage.getItem('memoryGameHighScore') || 0;
let gameActive = false;
let playerTurn = false;
let strictMode = false;
let winAtLevel = 20;

const colorButtons = {
    red: document.getElementById('red'),
    blue: document.getElementById('blue'),
    green: document.getElementById('green'),
    yellow: document.getElementById('yellow')
};

const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');
const currentScoreElement = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');
const currentLevelElement = document.getElementById('currentLevel');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const playAgainBtn = document.getElementById('playAgainBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    setupEventListeners();
    updateDisplay();
    disablePlayerInput();
}

function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', startGame);
    closeModalBtn.addEventListener('click', closeModal);

    // Strict mode toggle
    const strictToggle = document.getElementById('strictMode');
    strictToggle.addEventListener('change', (e) => {
        strictMode = e.target.checked;
    });

    // Color button event listeners
    Object.keys(colorButtons).forEach(color => {
        colorButtons[color].addEventListener('click', () => handlePlayerInput(color));
    });
}

function startGame() {
    resetGameState();
    gameActive = true;
    closeModal();
    updateStatus('Get ready...');
    disablePlayerInput();

    setTimeout(() => {
        nextLevel();
    }, 1000);
}

function resetGame() {
    resetGameState();
    gameActive = false;
    updateStatus('Press "Start Game" to begin');
    disablePlayerInput();
    updateDisplay();
}

function resetGameState() {
    sequence = [];
    playerSequence = [];
    level = 1;
    score = 0;
    playerTurn = false;
}

function nextLevel() {
    playerTurn = false;
    playerSequence = [];

    // Add new color to sequence
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);

    updateDisplay();
    updateStatus('Watch the sequence...');

    // Play the sequence
    playSequence();

    // Allow player input after sequence is shown
    setTimeout(() => {
        playerTurn = true;
        updateStatus('Your turn! Repeat the sequence.');
        enablePlayerInput();
    }, sequence.length * 600 + 1000);
}

function playSequence() {
    sequence.forEach((color, index) => {
        setTimeout(() => {
            flashButton(color);
        }, index * 600);
    });
}

function flashButton(color) {
    const button = colorButtons[color];
    button.classList.add('active');
    button.classList.add('playing');

    // Play sound (visual feedback for now)
    playSound(color);

    setTimeout(() => {
        button.classList.remove('active');
        button.classList.remove('playing');
    }, 400);
}

function playSound(color) {
    const soundUrls = {
        red: 'https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-1.mp3',
        blue: 'https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-2.mp3',
        green: 'https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-3.mp3',
        yellow: 'https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-4.mp3'
    };

    const audio = new Audio(soundUrls[color]);
    audio.play().catch(e => console.log('Audio play failed:', e));

    // Keep visual feedback as well
    const button = colorButtons[color];
    button.style.transform = 'scale(1.1)';

    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function handlePlayerInput(color) {
    if (!gameActive || !playerTurn) return;

    playerSequence.push(color);
    flashButton(color);

    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        // Wrong color - notify and restart sequence
        wrongButton();
        return;
    }

    if (playerSequence.length === sequence.length) {
        // Completed the sequence correctly
        score += level * 10;
        updateScore();

        // Show success animation
        document.querySelector('.game-board').classList.add('success');
        setTimeout(() => {
            document.querySelector('.game-board').classList.remove('success');
        }, 600);

        updateStatus('Well done! Get ready for next level...');
        disablePlayerInput();

        setTimeout(() => {
            level++;

            // Check for win condition
            if (level > winAtLevel) {
                gameWin();
                return;
            }

            nextLevel();
        }, 1500);
    }
}

function wrongButton() {
    playerTurn = false;
    disablePlayerInput();

    // Visual feedback for wrong button
    document.querySelector('.game-board').classList.add('error');
    setTimeout(() => {
        document.querySelector('.game-board').classList.remove('error');
    }, 600);

    updateStatus('Wrong! Watch again...');

    // In strict mode, game over with new sequence
    if (strictMode) {
        setTimeout(() => {
            gameOver();
        }, 1000);
        return;
    }

    // Otherwise, restart the same sequence
    setTimeout(() => {
        playerSequence = [];
        updateStatus('Watch the sequence...');
        playSequence();

        setTimeout(() => {
            playerTurn = true;
            updateStatus('Your turn! Repeat the sequence.');
            enablePlayerInput();
        }, sequence.length * 600 + 1000);
    }, 1500);
}

function gameWin() {
    gameActive = false;
    playerTurn = false;
    disablePlayerInput();

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('memoryGameHighScore', highScore);
    }

    updateDisplay();
    updateStatus('🎉 Congratulations! You Won! 🎉');

    // Show win modal (reuse game over modal for now)
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    gameOverModal.classList.remove('hidden');

    // Add win styling
    gameOverModal.querySelector('h2').textContent = 'You Won!';
}

function gameOver() {
    gameActive = false;
    playerTurn = false;
    disablePlayerInput();

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('memoryGameHighScore', highScore);
    }

    updateDisplay();
    updateStatus('Game Over!');

    // Show game over modal
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    gameOverModal.classList.remove('hidden');
}

function enablePlayerInput() {
    Object.values(colorButtons).forEach(button => {
        button.style.cursor = 'pointer';
    });
}

function disablePlayerInput() {
    Object.values(colorButtons).forEach(button => {
        button.style.cursor = 'not-allowed';
    });
}

function updateStatus(message) {
    statusText.textContent = message;
}

function updateDisplay() {
    currentScoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    currentLevelElement.textContent = level;
}

function updateScore() {
    currentScoreElement.textContent = score;
    if (score > highScore) {
        highScoreElement.textContent = score;
    }
}

function closeModal() {
    gameOverModal.classList.add('hidden');
}

// Keyboard controls
document.addEventListener('keydown', function(event) {
    if (!gameActive) return;

    const keyMap = {
        'r': 'red',
        'b': 'blue',
        'g': 'green',
        'y': 'yellow'
    };

    if (keyMap[event.key.toLowerCase()]) {
        handlePlayerInput(keyMap[event.key.toLowerCase()]);
    }
});

// Add visual hints for keyboard controls
function addKeyboardHints() {
    const hints = {
        red: 'R',
        blue: 'B',
        green: 'G',
        yellow: 'Y'
    };

    Object.keys(colorButtons).forEach(color => {
        const button = colorButtons[color];
        const hint = document.createElement('div');
        hint.textContent = hints[color];
        hint.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255, 255, 255, 0.8);
            font-weight: bold;
            font-size: 1.2rem;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        button.appendChild(hint);

        button.addEventListener('mouseenter', () => {
            hint.style.opacity = '1';
        });

        button.addEventListener('mouseleave', () => {
            hint.style.opacity = '0';
        });
    });
}

// Initialize keyboard hints
addKeyboardHints();
