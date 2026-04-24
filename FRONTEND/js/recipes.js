// recipes.js — runs on recipes.html
// Its job:
// 1. Load all recipes from the API when page opens
// 2. Re-fetch with filters when user clicks filter buttons
// 3. Build and inject recipe cards into the grid

// ─────────────────────────────────────────
// Track the currently active filters
// These change when the user clicks filter buttons
// ─────────────────────────────────────────
let activeCategory = 'all';   // 'all', 'vegan', or 'vegetarian'
let activePrepTime = 'all';   // 'all', '15', '30', or '60'


// ─────────────────────────────────────────
// When the page loads, fetch all recipes
// and set up the filter button click events
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Load all recipes immediately on page open
    loadRecipes();

    // ── Category filter buttons ──
    // querySelectorAll returns ALL elements matching the selector
    // We loop through and attach a click listener to each one
    document.querySelectorAll('[data-category]').forEach(btn => {
        btn.addEventListener('click', () => {

            // Update the active category
            activeCategory = btn.dataset.category; // reads the data-category attribute

            // Update which button looks "active" (highlighted)
            // First remove active from all category buttons
            document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
            // Then add active only to the clicked one
            btn.classList.add('active');

            // Re-fetch recipes with the new filter applied
            loadRecipes();
        });
    });

    // ── Prep time filter buttons ──
    document.querySelectorAll('[data-prep]').forEach(btn => {
        btn.addEventListener('click', () => {

            activePrepTime = btn.dataset.prep; // reads the data-prep attribute

            document.querySelectorAll('[data-prep]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            loadRecipes();
        });
    });
});


// ─────────────────────────────────────────
// Fetch recipes from the API
// Builds the API URL based on active filters
// ─────────────────────────────────────────
async function loadRecipes() {

    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = '<p class="loading-text">Loading recipes...</p>';

    // ── Build the API URL with query parameters ──
    // Start with the base URL
    let url = '/api/recipes?';

    // Add category filter if not "all"
    if (activeCategory !== 'all') {
        url += `category=${activeCategory}&`;
    }

    // Add prep time filter if not "all"
    if (activePrepTime !== 'all') {
        url += `maxPrepTime=${activePrepTime}&`;
    }

    // Example of what url might look like:
    // /api/recipes?category=vegan&maxPrepTime=30&

    try {
        const response = await fetch(url);
        const result   = await response.json();

        if (!result.success) throw new Error(result.message);

        // Show a message if no recipes match the filter
        if (result.data.length === 0) {
            grid.innerHTML = '<p class="loading-text">No recipes found. Try a different filter!</p>';
            return;
        }

        // Clear loading message and inject cards
        grid.innerHTML = '';
        result.data.forEach(recipe => {
            grid.innerHTML += buildRecipeCard(recipe);
        });

    } catch (error) {
        console.error('Failed to load recipes:', error);
        grid.innerHTML = '<p class="loading-text">Could not load recipes. Please try again.</p>';
    }
}


// ─────────────────────────────────────────
// Build a single recipe card HTML string
// This is the same function as in main.js
// Later we could move this to a shared file
// ─────────────────────────────────────────
function buildRecipeCard(recipe) {

    const cookDisplay  = recipe.cookTime === 0 ? 'No cook' : `${recipe.cookTime} mins cook`;
    const categoryLabel = recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1);

    const imageSection = recipe.image
        ? `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">`
        : `<div class="recipe-img-placeholder"><p>Image coming soon</p></div>`;

    return `
        <div class="recipe-card">
            ${imageSection}
            <div class="recipe-card-body">
                <span class="recipe-tag">${categoryLabel}</span>
                <h3 class="recipe-name">${recipe.title}</h3>
                <p class="recipe-desc">${recipe.description}</p>
                <div class="recipe-meta">
                    <span>⏱ ${recipe.prepTime} mins prep</span>
                    <span>🍳 ${cookDisplay}</span>
                    <span>🍽 Serves ${recipe.servings}</span>
                </div>
                <a href="recipe-detail.html?id=${recipe._id}" class="recipe-btn">View Recipe</a>
            </div>
        </div>
    `;
}