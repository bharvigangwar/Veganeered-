// recipes.js — runs on recipes.html
// Handles: category filter, prep time filter, search, calorie filter

// ─────────────────────────────────────────
// Read category from URL if coming from
// "Explore Vegan" or "Explore Vegetarian" buttons
// ─────────────────────────────────────────
const urlParams    = new URLSearchParams(window.location.search);
let activeCategory = urlParams.get('category') || 'all';
let activePrepTime = 'all';

// Store ALL recipes from API so we can search
// without making a new API call every keystroke
let allRecipes = [];


document.addEventListener('DOMContentLoaded', () => {

    // ── Highlight correct category button if came from URL ──
    if (activeCategory !== 'all') {
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-category="${activeCategory}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Load recipes on page open
    loadRecipes();

    // ── Category filter buttons ──
    document.querySelectorAll('[data-category]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.dataset.category;
            document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadRecipes();
        });
    });

    // ── Prep time filter buttons ──
    document.querySelectorAll('[data-prep]').forEach(btn => {
        btn.addEventListener('click', () => {
            activePrepTime = btn.dataset.prep;
            document.querySelectorAll('[data-prep]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadRecipes();
        });
    });

    // ── Search input ──
    // Runs filterAndRender() on every keystroke
    // No new API call — searches already loaded recipes
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();

        // Show or hide the clear button
        if (query.length > 0) {
            searchClear.classList.remove('hidden');
        } else {
            searchClear.classList.add('hidden');
        }

        // Filter already loaded recipes
        filterAndRender(query);
    });
});


// ─────────────────────────────────────────
// Fetch recipes from API
// Stores them in allRecipes so search
// can filter without extra API calls
// ─────────────────────────────────────────
async function loadRecipes() {

    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = '<p class="loading-text">Loading recipes...</p>';

    // Build API URL with active filters
    let url = '/api/recipes?';
    if (activeCategory !== 'all') url += `category=${activeCategory}&`;
    if (activePrepTime !== 'all') url += `maxPrepTime=${activePrepTime}&`;

    try {
        const response = await fetch(url);
        const result   = await response.json();

        if (!result.success) throw new Error(result.message);

        // Store all recipes for search to use
        allRecipes = result.data;

        if (allRecipes.length === 0) {
            grid.innerHTML = '<p class="loading-text">No recipes found.</p>';
            return;
        }

        // Render all recipes initially
        renderCards(allRecipes);

    } catch (error) {
        console.error('Failed to load recipes:', error);
        grid.innerHTML = '<p class="loading-text">Could not load recipes.</p>';
    }
}


// ─────────────────────────────────────────
// Filter already loaded recipes by search query
// Called on every keystroke — no API call needed
// ─────────────────────────────────────────
function filterAndRender(query) {

    if (!query) {
        // Empty search — show all recipes
        renderCards(allRecipes);
        return;
    }

    // Convert query to lowercase for case-insensitive search
    const q = query.toLowerCase();

    // Filter recipes where title OR description contains the query
    const filtered = allRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(q) ||
        recipe.description.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
        document.getElementById('recipes-grid').innerHTML =
            `<p class="loading-text">No recipes found for "${query}"</p>`;
        return;
    }

    renderCards(filtered);
}


// ─────────────────────────────────────────
// Clear search input and show all recipes
// ─────────────────────────────────────────
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    searchInput.value = '';
    searchClear.classList.add('hidden');
    renderCards(allRecipes);
}


// ─────────────────────────────────────────
// Render an array of recipe cards into the grid
// ─────────────────────────────────────────
function renderCards(recipes) {
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = '';
    recipes.forEach(recipe => {
        grid.innerHTML += buildRecipeCard(recipe);
    });
}


// ─────────────────────────────────────────
// Build a single recipe card HTML string
// ─────────────────────────────────────────
function buildRecipeCard(recipe) {

    const cookDisplay   = recipe.cookTime === 0 ? 'No cook' : `${recipe.cookTime} mins cook`;
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
                <a href="/recipe-detail.html?id=${recipe._id}" class="recipe-btn">View Recipe</a>
            </div>
        </div>
    `;
}