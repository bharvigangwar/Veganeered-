// main.js — runs on the home page (index.html)
// Its job: fetch featured recipes from the API and show them as cards

// ─────────────────────────────────────────
// Wait for the page HTML to fully load
// before running any JavaScript
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedRecipes();
});


// ─────────────────────────────────────────
// STEP 1: Fetch featured recipes from API
// API call: GET /api/recipes?isFeatured=true
// ─────────────────────────────────────────
async function loadFeaturedRecipes() {

    // Get the grid container where cards will be injected
    const grid = document.getElementById('featured-grid');

    // Show a loading message while we wait for the API
    grid.innerHTML = '<p class="loading-text">Loading recipes...</p>';

    try {
        // fetch() makes an HTTP request to our own backend API
        // async/await means we wait for the response before continuing
        const response = await fetch('/api/recipes?isFeatured=true');

        // .json() converts the raw response into a JavaScript object
        const result = await response.json();

        // If the API returned an error, throw it so catch() handles it
        if (!result.success) throw new Error(result.message);

        // If no featured recipes exist yet, show a friendly message
        if (result.data.length === 0) {
            grid.innerHTML = '<p class="loading-text">No featured recipes yet.</p>';
            return;
        }

        // STEP 2: Build HTML cards from the recipe data
        // We only show the first 3 featured recipes on the home page
        const featured = result.data.slice(0, 3);

        // Clear the loading message
        grid.innerHTML = '';

        // Loop through each recipe and create a card
        featured.forEach(recipe => {
            grid.innerHTML += buildRecipeCard(recipe);
        });

    } catch (error) {
        // Something went wrong — show error message instead of crashing
        console.error('Failed to load recipes:', error);
        grid.innerHTML = '<p class="loading-text">Could not load recipes. Please try again.</p>';
    }
}


// ─────────────────────────────────────────
// STEP 2: Build a single recipe card as HTML string
// Takes one recipe object from MongoDB
// Returns an HTML string to inject into the grid
// ─────────────────────────────────────────
function buildRecipeCard(recipe) {

    // Format cook time — show "No cook" if cookTime is 0
    const cookDisplay = recipe.cookTime === 0
        ? 'No cook'
        : `${recipe.cookTime} mins cook`;

    // Capitalise first letter of category for display (vegan → Vegan)
    const categoryLabel = recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1);

    // Build the image section — show real image if available, placeholder if not
    const imageSection = recipe.image
        ? `<img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">`
        : `<div class="recipe-img-placeholder"><p>Image coming soon</p></div>`;

    // Return the full card HTML
    // recipe._id is MongoDB's unique ID — used to link to the detail page
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

                <!-- Pass the recipe ID in the URL so detail page knows which recipe to load -->
                <a href="recipe-detail.html?id=${recipe._id}" class="recipe-btn">View Recipe</a>
            </div>

        </div>
    `;
}