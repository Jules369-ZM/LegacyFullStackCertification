const svg = document.getElementById('light-bright-grid');
const currentColorElement = document.getElementById('current-color');
const resetBtn = document.getElementById('reset-btn');
const resetAllBtn = document.getElementById('reset-all-btn');

// Color palette
const colors = [
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Blue
    '#96ceb4', // Green
    '#ffeaa7', // Yellow
    '#dda0dd', // Plum
    '#98d8c8', // Mint
    '#f7dc6f', // Gold
    '#bb8fce', // Purple
    '#85c1e9'  // Sky Blue
];

let currentColorIndex = 0;
let circles = [];
let actionHistory = []; // For undo functionality
let isMouseDown = false;
let lastColoredCircle = null;

// Create grid of circles
function createGrid() {
    const rows = 8;
    const cols = 12;
    const circleRadius = 18;
    const spacing = 45;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * spacing + spacing;
            const y = row * spacing + spacing;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', circleRadius);
            circle.setAttribute('fill', 'rgba(255, 255, 255, 0.1)');
            circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
            circle.setAttribute('stroke-width', '1');
            circle.dataset.row = row;
            circle.dataset.col = col;
            circle.dataset.originalFill = circle.getAttribute('fill');

            svg.appendChild(circle);
            circles.push(circle);
        }
    }
}

// Update current color display
function updateCurrentColor() {
    currentColorElement.style.backgroundColor = colors[currentColorIndex];
}

// Color a circle
function colorCircle(circle, color) {
    const previousColor = circle.getAttribute('fill');
    circle.setAttribute('fill', color);
    actionHistory.push({
        circle: circle,
        previousColor: previousColor,
        newColor: color
    });
}

// Remove color from circle
function removeColor(circle) {
    const previousColor = circle.getAttribute('fill');
    circle.setAttribute('fill', circle.dataset.originalFill);
    actionHistory.push({
        circle: circle,
        previousColor: previousColor,
        newColor: circle.dataset.originalFill
    });
}

// Handle circle click
function handleCircleClick(circle, event) {
    event.preventDefault();

    const currentFill = circle.getAttribute('fill');
    const isColored = currentFill !== circle.dataset.originalFill;

    if (isColored) {
        // If colored, change to next color
        colorCircle(circle, colors[currentColorIndex]);
    } else {
        // If not colored, color with current color
        colorCircle(circle, colors[currentColorIndex]);
    }

    // Move to next color
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    updateCurrentColor();
}

// Handle circle double click
function handleCircleDoubleClick(circle, event) {
    event.preventDefault();
    const currentFill = circle.getAttribute('fill');
    if (currentFill !== circle.dataset.originalFill) {
        removeColor(circle);
    }
}

// Mouse event handlers
function handleMouseDown(event) {
    if (event.target.tagName === 'circle') {
        isMouseDown = true;
        const circle = event.target;
        const currentFill = circle.getAttribute('fill');
        if (currentFill === circle.dataset.originalFill) {
            colorCircle(circle, colors[currentColorIndex]);
            lastColoredCircle = circle;
        }
    }
}

function handleMouseMove(event) {
    if (isMouseDown && event.target.tagName === 'circle') {
        const circle = event.target;
        const currentFill = circle.getAttribute('fill');
        if (currentFill === circle.dataset.originalFill) {
            colorCircle(circle, colors[currentColorIndex]);
        }
    }
}

function handleMouseUp() {
    isMouseDown = false;
    if (lastColoredCircle) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        updateCurrentColor();
        lastColoredCircle = null;
    }
}

// Reset last action
function resetLast() {
    if (actionHistory.length > 0) {
        const lastAction = actionHistory.pop();
        lastAction.circle.setAttribute('fill', lastAction.previousColor);
    }
}

// Reset all colors
function resetAll() {
    circles.forEach(circle => {
        circle.setAttribute('fill', circle.dataset.originalFill);
    });
    actionHistory = [];
}

// Initialize
createGrid();
updateCurrentColor();

// Event listeners
svg.addEventListener('mousedown', handleMouseDown);
svg.addEventListener('mousemove', handleMouseMove);
svg.addEventListener('mouseup', handleMouseUp);

circles.forEach(circle => {
    circle.addEventListener('click', (event) => {
        if (!isMouseDown) { // Only handle click if not dragging
            handleCircleClick(circle, event);
        }
    });
    circle.addEventListener('dblclick', (event) => handleCircleDoubleClick(circle, event));
});

resetBtn.addEventListener('click', resetLast);
resetAllBtn.addEventListener('click', resetAll);
