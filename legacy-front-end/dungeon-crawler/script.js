// Roguelike Dungeon Crawler Game

// Game constants
const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const VISIBILITY_RADIUS = 3;

// Game state
let gameState = {
    player: {
        x: 1,
        y: 1,
        health: 100,
        maxHealth: 100,
        level: 1,
        xp: 0,
        xpToNext: 100,
        weapon: 'Stick',
        attackMin: 5,
        attackMax: 8
    },
    map: [],
    entities: [],
    explored: [],
    floor: 1,
    gameActive: false
};

// DOM elements
const gameMap = document.getElementById('gameMap');
const healthFill = document.getElementById('healthFill');
const healthText = document.getElementById('healthText');
const playerLevel = document.getElementById('playerLevel');
const playerXP = document.getElementById('playerXP');
const playerWeapon = document.getElementById('playerWeapon');
const playerAttack = document.getElementById('playerAttack');
const currentFloor = document.getElementById('currentFloor');
const enemiesLeft = document.getElementById('enemiesLeft');
const itemsFound = document.getElementById('itemsFound');
const messageLog = document.getElementById('messageLog');
const gameOverModal = document.getElementById('gameOverModal');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverStats = document.getElementById('gameOverStats');

// Button elements
const newGameBtn = document.getElementById('newGameBtn');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showMessage('Welcome to the dungeon! Press "New Game" to begin your adventure.');
});

// Event listeners
function setupEventListeners() {
    newGameBtn.addEventListener('click', startNewGame);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', startNewGame);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Game initialization
function startNewGame() {
    initializeGame();
    gameState.gameActive = true;
    gameOverModal.classList.add('hidden');
    updateUI();
    renderMap();
    showMessage('You enter the dungeon. Use WASD or arrow keys to move.');
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
        gameState.gameActive = false;
        gameOverModal.classList.add('hidden');
        clearMap();
        showMessage('Game reset. Press "New Game" to start over.');
    }
}

function initializeGame() {
    // Reset player
    gameState.player = {
        x: 1,
        y: 1,
        health: 100,
        maxHealth: 100,
        level: 1,
        xp: 0,
        xpToNext: 100,
        weapon: 'Stick',
        attackMin: 5,
        attackMax: 8
    };

    // Reset game state
    gameState.floor = 1;
    gameState.entities = [];
    gameState.explored = [];

    // Generate map
    generateMap();

    // Place entities
    placeEntities();

    // Initialize explored array
    for (let y = 0; y < MAP_HEIGHT; y++) {
        gameState.explored[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            gameState.explored[y][x] = false;
        }
    }

    // Reveal starting area
    revealArea(gameState.player.x, gameState.player.y);
}

// Map generation
function generateMap() {
    gameState.map = [];

    // Create empty map
    for (let y = 0; y < MAP_HEIGHT; y++) {
        gameState.map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Create walls around the edges
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                gameState.map[y][x] = 'wall';
            } else {
                gameState.map[y][x] = 'floor';
            }
        }
    }

    // Add some random walls
    for (let i = 0; i < 50; i++) {
        const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
        const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        if ((x !== 1 || y !== 1) && (x !== MAP_WIDTH - 2 || y !== MAP_HEIGHT - 2)) {
            gameState.map[y][x] = 'wall';
        }
    }
}

// Entity placement
function placeEntities() {
    const entities = [];

    // Place enemies (5-8 enemies)
    const enemyCount = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        } while (
            (x === gameState.player.x && y === gameState.player.y) ||
            gameState.map[y][x] === 'wall' ||
            entities.some(e => e.x === x && e.y === y)
        );

        entities.push({
            type: 'enemy',
            x: x,
            y: y,
            level: Math.floor(Math.random() * 3) + 1,
            health: 20 + Math.floor(Math.random() * 20)
        });
    }

    // Place boss
    let bossX, bossY;
    do {
        bossX = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
        bossY = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
    } while (
        (bossX === gameState.player.x && bossY === gameState.player.y) ||
        gameState.map[bossY][bossX] === 'wall' ||
        entities.some(e => e.x === bossX && e.y === bossY)
    );

    entities.push({
        type: 'boss',
        x: bossX,
        y: bossY,
        level: 5,
        health: 100
    });

    // Place weapons (2-3 weapons)
    const weaponCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < weaponCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        } while (
            (x === gameState.player.x && y === gameState.player.y) ||
            gameState.map[y][x] === 'wall' ||
            entities.some(e => e.x === x && e.y === y)
        );

        const weapons = ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger'];
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];

        entities.push({
            type: 'weapon',
            x: x,
            y: y,
            name: weapon,
            attackMin: 8 + Math.floor(Math.random() * 7),
            attackMax: 15 + Math.floor(Math.random() * 10)
        });
    }

    // Place health potions (2-4 potions)
    const healthCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < healthCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        } while (
            (x === gameState.player.x && y === gameState.player.y) ||
            gameState.map[y][x] === 'wall' ||
            entities.some(e => e.x === x && e.y === y)
        );

        entities.push({
            type: 'health',
            x: x,
            y: y,
            healAmount: 25 + Math.floor(Math.random() * 25)
        });
    }

    gameState.entities = entities;
}

// Movement and collision
function handleKeyPress(event) {
    if (!gameState.gameActive) return;

    let dx = 0;
    let dy = 0;

    switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            dy = -1;
            break;
        case 's':
        case 'arrowdown':
            dy = 1;
            break;
        case 'a':
        case 'arrowleft':
            dx = -1;
            break;
        case 'd':
        case 'arrowright':
            dx = 1;
            break;
        default:
            return;
    }

    event.preventDefault();
    movePlayer(dx, dy);
}

function movePlayer(dx, dy) {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        return;
    }

    // Check for wall collision
    if (gameState.map[newY][newX] === 'wall') {
        return;
    }

    // Check for entity collision
    const entity = gameState.entities.find(e => e.x === newX && e.y === newY);
    if (entity) {
        if (entity.type === 'enemy' || entity.type === 'boss') {
            // Fight enemy
            fightEnemy(entity);
            return;
        } else if (entity.type === 'weapon') {
            // Pick up weapon
            pickupWeapon(entity);
        } else if (entity.type === 'health') {
            // Pick up health
            pickupHealth(entity);
        }
    }

    // Move player
    gameState.player.x = newX;
    gameState.player.y = newY;

    // Reveal area around player
    revealArea(newX, newY);

    // Update UI
    updateUI();
    renderMap();
}

// Combat system
function fightEnemy(enemy) {
    let playerTurn = true;
    let combatLog = [];

    while (gameState.player.health > 0 && enemy.health > 0) {
        if (playerTurn) {
            // Player attacks
            const damage = Math.floor(Math.random() * (gameState.player.attackMax - gameState.player.attackMin + 1)) + gameState.player.attackMin;
            enemy.health -= damage;
            combatLog.push(`You attack for ${damage} damage!`);

            if (enemy.health <= 0) {
                enemy.health = 0;
                combatLog.push(`You defeated the ${enemy.type === 'boss' ? 'boss' : 'enemy'}!`);

                // Award XP
                const xpGained = enemy.type === 'boss' ? 50 : enemy.level * 10;
                gameState.player.xp += xpGained;
                combatLog.push(`You gained ${xpGained} XP!`);

                // Check for level up
                if (gameState.player.xp >= gameState.player.xpToNext) {
                    levelUp();
                    combatLog.push(`You leveled up to level ${gameState.player.level}!`);
                }

                // Remove enemy
                gameState.entities = gameState.entities.filter(e => e !== enemy);

                // Check win condition
                if (enemy.type === 'boss') {
                    gameWin();
                    return;
                }

                break;
            }
        } else {
            // Enemy attacks
            const enemyAttack = enemy.level * 3 + Math.floor(Math.random() * 5);
            gameState.player.health -= enemyAttack;
            combatLog.push(`The ${enemy.type} attacks for ${enemyAttack} damage!`);

            if (gameState.player.health <= 0) {
                gameState.player.health = 0;
                gameOver();
                return;
            }
        }

        playerTurn = !playerTurn;
    }

    // Show combat log
    combatLog.forEach(message => showMessage(message, 'damage'));
    updateUI();
}

// Item pickup
function pickupWeapon(weapon) {
    gameState.player.weapon = weapon.name;
    gameState.player.attackMin = weapon.attackMin;
    gameState.player.attackMax = weapon.attackMax;

    // Remove weapon from map
    gameState.entities = gameState.entities.filter(e => e !== weapon);

    showMessage(`You found a ${weapon.name}! Attack: ${weapon.attackMin}-${weapon.attackMax}`, 'heal');
    updateUI();
}

function pickupHealth(health) {
    const oldHealth = gameState.player.health;
    gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + health.healAmount);

    // Remove health from map
    gameState.entities = gameState.entities.filter(e => e !== health);

    const healed = gameState.player.health - oldHealth;
    showMessage(`You drank a health potion and healed ${healed} HP!`, 'heal');
    updateUI();
}

// Leveling system
function levelUp() {
    gameState.player.level++;
    gameState.player.xp -= gameState.player.xpToNext;
    gameState.player.xpToNext = gameState.player.level * 100;
    gameState.player.maxHealth += 20;
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.attackMin += 2;
    gameState.player.attackMax += 3;

    showMessage(`Level up! You are now level ${gameState.player.level}!`, 'level-up');
}

// Fog of war
function revealArea(centerX, centerY) {
    for (let dy = -VISIBILITY_RADIUS; dy <= VISIBILITY_RADIUS; dy++) {
        for (let dx = -VISIBILITY_RADIUS; dx <= VISIBILITY_RADIUS; dx++) {
            const x = centerX + dx;
            const y = centerY + dy;

            if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                gameState.explored[y][x] = true;
            }
        }
    }
}

// UI updates
function updateUI() {
    // Update health
    const healthPercent = (gameState.player.health / gameState.player.maxHealth) * 100;
    healthFill.style.width = `${healthPercent}%`;
    healthText.textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;

    // Update other stats
    playerLevel.textContent = gameState.player.level;
    playerXP.textContent = gameState.player.xp;
    document.querySelector('.xp-needed').textContent = `/ ${gameState.player.xpToNext}`;
    playerWeapon.textContent = gameState.player.weapon;
    playerAttack.textContent = `${gameState.player.attackMin}-${gameState.player.attackMax}`;

    // Update game info
    currentFloor.textContent = gameState.floor;
    const enemyCount = gameState.entities.filter(e => e.type === 'enemy' || e.type === 'boss').length;
    enemiesLeft.textContent = enemyCount;
    const itemCount = gameState.entities.filter(e => e.type === 'weapon' || e.type === 'health').length;
    itemsFound.textContent = gameState.entities.filter(e => e.type === 'weapon' || e.type === 'health').length;
}

// Rendering
function renderMap() {
    gameMap.innerHTML = '';

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (!gameState.explored[y][x]) {
                cell.classList.add('unknown');
                cell.textContent = '?';
            } else {
                // Check for entities first
                const entity = gameState.entities.find(e => e.x === x && e.y === y);
                if (entity) {
                    cell.classList.add(entity.type);
                    cell.textContent = getEntitySymbol(entity);
                } else if (x === gameState.player.x && y === gameState.player.y) {
                    cell.classList.add('player');
                    cell.textContent = '@';
                } else {
                    cell.classList.add(gameState.map[y][x]);
                    cell.textContent = getMapSymbol(gameState.map[y][x]);
                }
            }

            gameMap.appendChild(cell);
        }
    }
}

function getEntitySymbol(entity) {
    switch (entity.type) {
        case 'enemy': return 'E';
        case 'boss': return 'B';
        case 'weapon': return 'W';
        case 'health': return 'H';
        default: return '?';
    }
}

function getMapSymbol(mapType) {
    switch (mapType) {
        case 'wall': return '#';
        case 'floor': return '.';
        default: return '?';
    }
}

function clearMap() {
    gameMap.innerHTML = '';
}

// Messages
function showMessage(text, type = '') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    messageLog.appendChild(message);
    messageLog.scrollTop = messageLog.scrollHeight;

    // Limit message history
    while (messageLog.children.length > 20) {
        messageLog.removeChild(messageLog.firstChild);
    }
}

// Game end conditions
function gameWin() {
    gameState.gameActive = false;
    gameOverTitle.textContent = 'Victory!';
    gameOverStats.innerHTML = `
        <p>You defeated the boss and conquered the dungeon!</p>
        <p>Final Level: ${gameState.player.level}</p>
        <p>Final XP: ${gameState.player.xp}</p>
        <p>Weapon: ${gameState.player.weapon}</p>
    `;
    gameOverModal.classList.remove('hidden');
    showMessage('🏆 Congratulations! You won the game! 🏆', 'victory');
}

function gameOver() {
    gameState.gameActive = false;
    gameOverTitle.textContent = 'Game Over';
    gameOverStats.innerHTML = `
        <p>You were defeated by the dungeon's dangers.</p>
        <p>Final Level: ${gameState.player.level}</p>
        <p>Final XP: ${gameState.player.xp}</p>
    `;
    gameOverModal.classList.remove('hidden');
    showMessage('💀 Game Over! Better luck next time.', 'damage');
}
