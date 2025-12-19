// Recipe Box Application
const STORAGE_KEY = '_recipebox_recipes';

// DOM Elements
const recipeListView = document.getElementById('recipeListView');
const recipeDetailView = document.getElementById('recipeDetailView');
const recipeModal = document.getElementById('recipeModal');
const deleteModal = document.getElementById('deleteModal');

const recipeList = document.getElementById('recipeList');
const recipeDetail = document.getElementById('recipeDetail');
const emptyState = document.getElementById('emptyState');

const addRecipeBtn = document.getElementById('addRecipeBtn');
const backToListBtn = document.getElementById('backToListBtn');
const editRecipeBtn = document.getElementById('editRecipeBtn');
const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');

const recipeForm = document.getElementById('recipeForm');
const recipeNameInput = document.getElementById('recipeName');
const recipeIngredientsInput = document.getElementById('recipeIngredients');

const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');

const deleteRecipeName = document.getElementById('deleteRecipeName');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Global variables
let recipes = [];
let currentRecipeId = null;
let isEditing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadRecipes();
    setupEventListeners();
    showRecipeList();
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    addRecipeBtn.addEventListener('click', showAddRecipeModal);
    backToListBtn.addEventListener('click', showRecipeList);
    editRecipeBtn.addEventListener('click', showEditRecipeModal);
    deleteRecipeBtn.addEventListener('click', showDeleteConfirmation);

    // Modal controls
    closeModalBtn.addEventListener('click', hideRecipeModal);
    cancelBtn.addEventListener('click', hideRecipeModal);
    closeDeleteModalBtn.addEventListener('click', hideDeleteModal);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    confirmDeleteBtn.addEventListener('click', deleteRecipe);

    // Form submission
    recipeForm.addEventListener('submit', saveRecipe);

    // Modal backdrop click
    recipeModal.addEventListener('click', function(e) {
        if (e.target === recipeModal) {
            hideRecipeModal();
        }
    });

    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });
}

// Local Storage Functions
function loadRecipes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        recipes = JSON.parse(stored);
    } else {
        // Add some sample recipes for first-time users
        recipes = [
            {
                id: generateId(),
                name: 'Classic Spaghetti Carbonara',
                ingredients: [
                    '200g spaghetti',
                    '100g pancetta or bacon, diced',
                    '2 large eggs',
                    '50g grated Parmesan cheese',
                    '50g grated Pecorino cheese',
                    'Black pepper, freshly ground',
                    'Salt to taste'
                ]
            },
            {
                id: generateId(),
                name: 'Chicken Caesar Salad',
                ingredients: [
                    '2 boneless chicken breasts',
                    '1 head romaine lettuce',
                    '1/2 cup Caesar dressing',
                    '1/4 cup grated Parmesan cheese',
                    '1 cup croutons',
                    'Black pepper to taste'
                ]
            }
        ];
        saveRecipes();
    }
}

function saveRecipes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showRecipeList() {
    recipeListView.classList.remove('hidden');
    recipeDetailView.classList.add('hidden');
    renderRecipeList();
}

function showRecipeDetail(recipeId) {
    currentRecipeId = recipeId;
    recipeListView.classList.add('hidden');
    recipeDetailView.classList.remove('hidden');
    renderRecipeDetail(recipeId);
}

function showAddRecipeModal() {
    isEditing = false;
    modalTitle.textContent = 'Add Recipe';
    recipeForm.reset();
    recipeModal.classList.remove('hidden');
    recipeNameInput.focus();
}

function showEditRecipeModal() {
    isEditing = true;
    const recipe = recipes.find(r => r.id === currentRecipeId);
    if (recipe) {
        modalTitle.textContent = 'Edit Recipe';
        recipeNameInput.value = recipe.name;
        recipeIngredientsInput.value = recipe.ingredients.join('\n');
        recipeModal.classList.remove('hidden');
        recipeNameInput.focus();
    }
}

function showDeleteConfirmation() {
    const recipe = recipes.find(r => r.id === currentRecipeId);
    if (recipe) {
        deleteRecipeName.textContent = recipe.name;
        deleteModal.classList.remove('hidden');
    }
}

function hideRecipeModal() {
    recipeModal.classList.add('hidden');
    recipeForm.reset();
    isEditing = false;
}

function hideDeleteModal() {
    deleteModal.classList.add('hidden');
}

// CRUD Operations
function saveRecipe(e) {
    e.preventDefault();

    const name = recipeNameInput.value.trim();
    const ingredientsText = recipeIngredientsInput.value.trim();

    if (!name || !ingredientsText) {
        alert('Please fill in all fields');
        return;
    }

    // Parse ingredients (one per line)
    const ingredients = ingredientsText.split('\n')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);

    if (ingredients.length === 0) {
        alert('Please add at least one ingredient');
        return;
    }

    if (isEditing) {
        // Update existing recipe
        const recipe = recipes.find(r => r.id === currentRecipeId);
        if (recipe) {
            recipe.name = name;
            recipe.ingredients = ingredients;
        }
    } else {
        // Create new recipe
        const newRecipe = {
            id: generateId(),
            name: name,
            ingredients: ingredients
        };
        recipes.push(newRecipe);
    }

    saveRecipes();
    hideRecipeModal();
    showRecipeList();
}

function deleteRecipe() {
    recipes = recipes.filter(r => r.id !== currentRecipeId);
    saveRecipes();
    hideDeleteModal();
    showRecipeList();
}

// Rendering Functions
function renderRecipeList() {
    recipeList.innerHTML = '';

    if (recipes.length === 0) {
        emptyState.classList.remove('hidden');
        recipeList.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    recipeList.classList.remove('hidden');

    recipes.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-item';
        recipeElement.onclick = () => showRecipeDetail(recipe.id);

        recipeElement.innerHTML = `
            <h3>${recipe.name}</h3>
            <p>${recipe.ingredients.length} ingredient${recipe.ingredients.length !== 1 ? 's' : ''}</p>
            <div class="meta">
                <span><i class="fas fa-list-ul"></i> ${recipe.ingredients.length} items</span>
            </div>
        `;

        recipeList.appendChild(recipeElement);
    });
}

function renderRecipeDetail(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
        showRecipeList();
        return;
    }

    recipeDetail.innerHTML = `
        <h2>${recipe.name}</h2>

        <h3><i class="fas fa-list-ul"></i> Ingredients</h3>
        <div class="ingredients-list">
            <ul>
                ${recipe.ingredients.map(ingredient =>
                    `<li><i class="fas fa-check-circle"></i> ${ingredient}</li>`
                ).join('')}
            </ul>
        </div>
    `;
}
