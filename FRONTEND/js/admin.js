// admin.js — handles both login.html and dashboard.html
// Login:     sends credentials to API, stores token in localStorage
// Dashboard: loads recipes, handles add / edit / delete

// ─────────────────────────────────────────
// LOGIN FUNCTION
// Called when admin clicks the Login button
// ─────────────────────────────────────────
async function handleLogin() {

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorBox = document.getElementById('login-error');
    const btn      = document.getElementById('login-btn');

    // Basic validation — don't send empty fields
    if (!username || !password) {
        errorBox.textContent = 'Please enter both username and password.';
        errorBox.classList.remove('hidden');
        return;
    }

    // Disable button while request is in progress
    btn.textContent = 'Logging in...';
    btn.disabled    = true;

    try {
        // POST credentials to our backend login route
        const response = await fetch('/api/admin/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (!result.success) {
            // Wrong credentials — show error message
            errorBox.textContent = 'Invalid username or password.';
            errorBox.classList.remove('hidden');
            btn.textContent = 'Login';
            btn.disabled    = false;
            return;
        }

        // ✅ Login successful
        // Store the JWT token in localStorage
        // This token is sent with every admin API request
        localStorage.setItem('adminToken', result.token);

        // Redirect to the dashboard
        window.location.href = '/admin/dashboard.html';

    } catch (error) {
        console.error('Login error:', error);
        errorBox.textContent = 'Something went wrong. Please try again.';
        errorBox.classList.remove('hidden');
        btn.textContent = 'Login';
        btn.disabled    = false;
    }
}


// ─────────────────────────────────────────
// DASHBOARD — runs when dashboard.html loads
// Checks token exists, then loads all recipes
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Only run dashboard code if we are on the dashboard page
    // We check by looking for an element that only exists on dashboard
    if (!document.getElementById('recipe-list')) return;

    // Get the token stored during login
    const token = localStorage.getItem('adminToken');

    // If no token found, redirect to login page
    // This protects the dashboard from unauthorised access
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    // Token exists — load all recipes into the left panel
    loadAllRecipes();
});


// ─────────────────────────────────────────
// Load all recipes into the left panel table
// ─────────────────────────────────────────
async function loadAllRecipes() {

    const list = document.getElementById('recipe-list');
    list.innerHTML = '<p class="loading-text">Loading...</p>';

    try {
        const response = await fetch('/api/recipes');
        const result   = await response.json();

        if (!result.success) throw new Error(result.message);

        if (result.data.length === 0) {
            list.innerHTML = '<p class="loading-text">No recipes yet. Add one!</p>';
            return;
        }

        // Build a row for each recipe
        list.innerHTML = result.data.map(recipe => `
            <div class="recipe-row">

                <!-- Recipe info -->
                <div class="recipe-row-info">
                    <span class="recipe-row-title">${recipe.title}</span>
                    <span class="recipe-tag" style="font-size:10px">
                        ${recipe.category}
                    </span>
                </div>

                <!-- Action buttons -->
                <div class="recipe-row-actions">

                    <!-- Edit — fills the right panel form with this recipe's data -->
                    <button
                        class="row-btn edit-btn"
                        onclick="loadRecipeIntoForm('${recipe._id}')"
                    >
                        Edit
                    </button>

                    <!-- Delete — shows confirmation before deleting -->
                    <button
                        class="row-btn delete-btn"
                        onclick="deleteRecipe('${recipe._id}', '${recipe.title}')"
                    >
                        Delete
                    </button>

                </div>
            </div>
        `).join('');

    } catch (error) {
        list.innerHTML = '<p class="loading-text">Could not load recipes.</p>';
    }
}


// ─────────────────────────────────────────
// SUBMIT RECIPE — handles both Add and Edit
// Reads the hidden #edit-id field to decide
// Empty = Add mode | Has ID = Edit mode
// ─────────────────────────────────────────
async function submitRecipe() {

    const token   = localStorage.getItem('adminToken');
    const editId  = document.getElementById('edit-id').value;
    const message = document.getElementById('form-message');
    const btn     = document.getElementById('submit-btn');

    // ── Parse ingredients from textarea ──
    // Each line looks like: "400g | pasta"
    // We split by newline, then split each line by |
    const ingredientLines = document.getElementById('f-ingredients').value
        .split('\n')                          // split into lines
        .filter(line => line.trim() !== '')   // remove empty lines
        .map(line => {
            const parts = line.split('|');
            return {
                amount: parts[0]?.trim() || '',
                name:   parts[1]?.trim() || ''
            };
        });

    // ── Parse steps from textarea ──
    // Each line is one step — numbered automatically
    const stepLines = document.getElementById('f-steps').value
        .split('\n')
        .filter(line => line.trim() !== '')
        .map((line, index) => ({
            stepNumber:  index + 1,       // auto number starting from 1
            instruction: line.trim()
        }));

    // ── Build the recipe object to send to the API ──
    const recipeData = {
        title:       document.getElementById('f-title').value.trim(),
        category:    document.getElementById('f-category').value,
        description: document.getElementById('f-description').value.trim(),
        prepTime:    Number(document.getElementById('f-prepTime').value),
        cookTime:    Number(document.getElementById('f-cookTime').value),
        servings:    Number(document.getElementById('f-servings').value),
        image:       document.getElementById('f-image').value.trim(),
        isFeatured:  document.getElementById('f-featured').checked,
        ingredients: ingredientLines,
        steps:       stepLines,
    };

    // Basic validation
    if (!recipeData.title || !recipeData.description) {
        message.textContent = 'Please fill in at least the title and description.';
        message.className   = 'form-message error';
        return;
    }

    btn.textContent = 'Saving...';
    btn.disabled    = true;

    try {
        // Decide URL and method based on add vs edit mode
        const url    = editId ? `/api/admin/recipes/${editId}` : '/api/admin/recipes';
        const method = editId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type':  'application/json',
                // Send the JWT token in the Authorization header
                // The protect middleware in auth.js checks this
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recipeData)
        });

        const result = await response.json();

        if (!result.success) throw new Error(result.message);

        // ✅ Success — show message, reset form, reload list
        message.textContent = editId ? 'Recipe updated!' : 'Recipe added!';
        message.className   = 'form-message success';

        resetForm();
        loadAllRecipes();

    } catch (error) {
        message.textContent = `Error: ${error.message}`;
        message.className   = 'form-message error';
    } finally {
        // Always re-enable the button whether it succeeded or failed
        btn.textContent = document.getElementById('edit-id').value ? 'Update Recipe' : 'Add Recipe';
        btn.disabled    = false;
    }
}


// ─────────────────────────────────────────
// LOAD RECIPE INTO FORM for editing
// Fetches one recipe by ID and fills all form fields
// ─────────────────────────────────────────
async function loadRecipeIntoForm(id) {

    try {
        const response = await fetch(`/api/recipes/${id}`);
        const result   = await response.json();

        if (!result.success) throw new Error(result.message);

        const r = result.data;

        // Switch form to "Edit" mode
        document.getElementById('edit-id').value    = r._id;
        document.getElementById('form-title').textContent = 'Edit Recipe';
        document.getElementById('submit-btn').textContent = 'Update Recipe';

        // Fill all form fields with existing recipe data
        document.getElementById('f-title').value       = r.title;
        document.getElementById('f-category').value    = r.category;
        document.getElementById('f-description').value = r.description;
        document.getElementById('f-prepTime').value    = r.prepTime;
        document.getElementById('f-cookTime').value    = r.cookTime;
        document.getElementById('f-servings').value    = r.servings;
        document.getElementById('f-image').value       = r.image || '';
        document.getElementById('f-featured').checked  = r.isFeatured;

        // Convert ingredients array back to textarea format
        // [ { amount: '400g', name: 'pasta' } ] → "400g | pasta"
        document.getElementById('f-ingredients').value = r.ingredients
            .map(ing => `${ing.amount} | ${ing.name}`)
            .join('\n');

        // Convert steps array back to textarea format
        // [ { stepNumber: 1, instruction: 'Boil water' } ] → "Boil water"
        document.getElementById('f-steps').value = r.steps
            .map(s => s.instruction)
            .join('\n');

        // Scroll to the form so user can see it
        document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Could not load recipe for editing:', error);
    }
}


// ─────────────────────────────────────────
// DELETE RECIPE
// Shows a confirmation dialog before deleting
// ─────────────────────────────────────────
async function deleteRecipe(id, title) {

    // window.confirm() shows a browser popup — returns true if user clicks OK
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    const token = localStorage.getItem('adminToken');

    try {
        const response = await fetch(`/api/admin/recipes/${id}`, {
            method:  'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (!result.success) throw new Error(result.message);

        // Reload the recipe list to reflect the deletion
        loadAllRecipes();

    } catch (error) {
        alert(`Could not delete recipe: ${error.message}`);
    }
}


// ─────────────────────────────────────────
// RESET FORM
// Clears all fields and switches back to "Add" mode
// ─────────────────────────────────────────
function resetForm() {
    document.getElementById('edit-id').value           = '';
    document.getElementById('form-title').textContent  = 'Add Recipe';
    document.getElementById('submit-btn').textContent  = 'Add Recipe';
    document.getElementById('f-title').value           = '';
    document.getElementById('f-category').value        = 'vegan';
    document.getElementById('f-description').value     = '';
    document.getElementById('f-prepTime').value        = '';
    document.getElementById('f-cookTime').value        = '';
    document.getElementById('f-servings').value        = '';
    document.getElementById('f-image').value           = '';
    document.getElementById('f-featured').checked      = false;
    document.getElementById('f-ingredients').value     = '';
    document.getElementById('f-steps').value           = '';

    const msg = document.getElementById('form-message');
    if (msg) {
        msg.textContent = '';
        msg.className   = 'form-message hidden';
    }
}


// ─────────────────────────────────────────
// LOGOUT
// Removes the token from localStorage
// Redirects back to login page
// ─────────────────────────────────────────
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
}
