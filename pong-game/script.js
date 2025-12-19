const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5;
const BALL_SPEED = 4;

// Game state
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: BALL_SPEED,
    dy: BALL_SPEED
};

let playerPaddle = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    dy: 0
};

let computerPaddle = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    dy: 0
};

let playerScore = 0;
let computerScore = 0;

// Keyboard input
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function update() {
    // Player paddle movement
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - PADDLE_HEIGHT) {
        playerPaddle.y += PADDLE_SPEED;
    }

    // Computer paddle AI (unbeatable - follows ball perfectly)
    computerPaddle.y = ball.y - PADDLE_HEIGHT / 2;

    // Keep computer paddle within bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y > canvas.height - PADDLE_HEIGHT) computerPaddle.y = canvas.height - PADDLE_HEIGHT;

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y <= 0 || ball.y >= canvas.height - BALL_SIZE) {
        ball.dy = -ball.dy;
    }

    // Ball collision with paddles
    if (ball.x <= playerPaddle.x + PADDLE_WIDTH &&
        ball.x + BALL_SIZE >= playerPaddle.x &&
        ball.y <= playerPaddle.y + PADDLE_HEIGHT &&
        ball.y + BALL_SIZE >= playerPaddle.y) {
        ball.dx = -ball.dx;
    }

    if (ball.x + BALL_SIZE >= computerPaddle.x &&
        ball.x <= computerPaddle.x + PADDLE_WIDTH &&
        ball.y <= computerPaddle.y + PADDLE_HEIGHT &&
        ball.y + BALL_SIZE >= computerPaddle.y) {
        ball.dx = -ball.dx;
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        resetBall();
    } else if (ball.x > canvas.width) {
        playerScore++;
        resetBall();
    }

    updateScores();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED;
    ball.dy = Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED;
}

function updateScores() {
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    // Draw paddles with glow effect
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fff';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(computerPaddle.x, computerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Draw ball as circle
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE/2, ball.y + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
resetBall();
gameLoop();
