// recipe-detail.js — runs on recipe-detail.html
// Its job: read the recipe ID from the URL, fetch that recipe
// from the API, and build the full recipe page

document.addEventListener('DOMContentLoaded', () => {
    loadRecipe();
});


// ─────────────────────────────────────────
// STEP 1: Get the recipe ID from the URL
// URL looks like: /recipe-detail.html?id=abc123
// URLSearchParams is a built-in browser tool to read URL parameters
// ─────────────────────────────────────────
async function loadRecipe() {

    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');  // grabs the value after ?id=

    // If no ID in URL, show error and stop
    if (!id) {
        document.getElementById('recipe-detail').innerHTML =
            '<p class="loading-text" style="padding:80px 0">Recipe not found.</p>';
        return;
    }

    try {
        // Fetch this specific recipe from our API using its MongoDB ID
        const response = await fetch(`/api/recipes/${id}`);
        const result   = await response.json();

        if (!result.success) throw new Error(result.message);

        // STEP 2: Build and inject the full recipe page
        renderRecipe(result.data);

    } catch (error) {
        console.error('Failed to load recipe:', error);
        document.getElementById('recipe-detail').innerHTML =
            '<p class="loading-text" style="padding:80px 0">Could not load recipe.</p>';
    }
}


// ─────────────────────────────────────────
// STEP 2: Build the full recipe page HTML
// Takes the recipe object from MongoDB
// Injects it into the #recipe-detail container
// ─────────────────────────────────────────
function renderRecipe(recipe) {

    const detail = document.getElementById('recipe-detail');

    // Format category label for display
    const categoryLabel = recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1);

    // Format cook time — show "No cook" if 0
    const cookDisplay = recipe.cookTime === 0 ? 'No cook' : `${recipe.cookTime} mins`;

    // Build image — real image or placeholder
    const imageHTML = recipe.image
        ? `<img src="${recipe.image}" alt="${recipe.title}" class="detail-hero-img">`
        : `<div class="detail-img-placeholder"><p>Image coming soon</p></div>`;

    // Build ingredients list — loop through the array from MongoDB
    // Each ingredient has { amount, name }
    const ingredientsHTML = recipe.ingredients
        .map(ing => `<li><strong>${ing.amount}</strong> ${ing.name}</li>`)
        .join('');

    // Build steps list — loop through steps array
    // Each step has { stepNumber, instruction }
    const stepsHTML = recipe.steps
        .map(step => `
            <div class="detail-step">
                <div class="step-number">${step.stepNumber}</div>
                <p>${step.instruction}</p>
            </div>
        `)
        .join('');

    // Check if this recipe is bookmarked in localStorage
    // localStorage is browser storage — persists even after page reload
    const bookmarks   = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const isBookmarked = bookmarks.includes(recipe._id);

    // Inject the full page HTML
    detail.innerHTML = `

        <!-- ── Hero image ── -->
        <div class="detail-hero">
            ${imageHTML}
        </div>

        <!-- ── Recipe content ── -->
        <div class="detail-content">

            <!-- Left column — ingredients + steps -->
            <div class="detail-main">

                <!-- Title + meta -->
                <div class="detail-header">
                    <span class="recipe-tag">${categoryLabel}</span>
                    <h1 class="detail-title">${recipe.title}</h1>
                    <p class="detail-desc">${recipe.description}</p>

                    <!-- Prep / cook / servings row -->
                    <div class="detail-meta">
                        <div class="meta-box">
                            <span class="meta-label">Prep Time</span>
                            <span class="meta-value">${recipe.prepTime} mins</span>
                        </div>
                        <div class="meta-box">
                            <span class="meta-label">Cook Time</span>
                            <span class="meta-value">${cookDisplay}</span>
                        </div>
                        <div class="meta-box">
                            <span class="meta-label">Servings</span>
                            <span class="meta-value">${recipe.servings}</span>
                        </div>
                    </div>

                    <!-- Action buttons — bookmark, print, share -->
                    <div class="detail-actions">

                        <!-- Bookmark button — saves recipe ID to localStorage -->
                        <button
                            class="action-btn ${isBookmarked ? 'bookmarked' : ''}"
                            id="bookmark-btn"
                            onclick="toggleBookmark('${recipe._id}')"
                        >
                            ${isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
                        </button>

                        <!-- Print button — triggers browser print dialog -->
                        <button class="action-btn" onclick="window.print()">
                            🖨️ Print
                        </button>

                        <!-- Share button — copies page URL to clipboard -->
                        <button class="action-btn" onclick="shareRecipe()">
                            🔗 Share
                        </button>

                    </div>
                </div>

                <!-- Steps -->
                <div class="detail-steps">
                    <h2 class="detail-section-title">Instructions</h2>
                    ${stepsHTML}
                </div>

            </div>

            <!-- Right column — ingredients sidebar -->
            <aside class="detail-sidebar">
                <h2 class="detail-section-title">Ingredients</h2>
                <ul class="ingredients-list">
                    ${ingredientsHTML}
                </ul>
            </aside>

        </div>
    `;
}


// ─────────────────────────────────────────
// BOOKMARK FEATURE
// Saves/removes recipe ID in localStorage
// localStorage stores data in the browser — no server needed
// ─────────────────────────────────────────
function toggleBookmark(recipeId) {

    // Get current bookmarks array from localStorage (or empty array)
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

    const btn         = document.getElementById('bookmark-btn');
    const isBookmarked = bookmarks.includes(recipeId);

    if (isBookmarked) {
        // Already bookmarked — remove it
        bookmarks = bookmarks.filter(id => id !== recipeId);
        btn.textContent = '🔖 Bookmark';
        btn.classList.remove('bookmarked');
    } else {
        // Not bookmarked — add it
        bookmarks.push(recipeId);
        btn.textContent = '🔖 Bookmarked';
        btn.classList.add('bookmarked');
    }

    // Save updated bookmarks array back to localStorage
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}


// ─────────────────────────────────────────
// SHARE FEATURE
// Copies the current page URL to clipboard
// ─────────────────────────────────────────
function shareRecipe() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Could not copy link.'));
}
