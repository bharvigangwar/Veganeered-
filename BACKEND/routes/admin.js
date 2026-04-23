const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Recipe  = require('../models/Recipe');
const protect = require('../middleware/auth');

// ─────────────────────────────────────────
// POST /api/admin/login
// Public route — no token needed here
// Admin sends username + password → gets a token back
// ─────────────────────────────────────────
router.post('/login', (req, res) => {

    // Destructure username and password from the request body
    const { username, password } = req.body;

    // Compare against values stored in .env (never hardcode credentials!)
    if (
        username !== process.env.ADMIN_USERNAME ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid username or password' 
        });
    }

    // Credentials matched — create a JWT token
    // jwt.sign(payload, secret, options)
    // payload = data to store inside token (just username here)
    // expiresIn: '7d' = token expires after 7 days, admin must log in again
    const token = jwt.sign(
        { username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
    );

    res.json({ success: true, token });
});

// ─────────────────────────────────────────
// POST /api/admin/recipes
// Protected — must send valid token in header
// Creates a new recipe in MongoDB
// ─────────────────────────────────────────
router.post('/recipes', protect, async (req, res) => {
    try {
        // Recipe.create() validates the data against our schema
        // then saves it to MongoDB if everything is valid
        const recipe = await Recipe.create(req.body);

        // 201 = "Created" (more specific than 200 = "OK")
        res.status(201).json({ success: true, data: recipe });

    } catch (error) {
        // This catches validation errors (e.g. missing required fields)
        res.status(400).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────
// PUT /api/admin/recipes/:id
// Protected — updates an existing recipe by its MongoDB ID
// ─────────────────────────────────────────
router.put('/recipes/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndUpdate(
            req.params.id,   // the ID from the URL e.g. /api/admin/recipes/abc123
            req.body,        // the new data sent in the request
            {
                new: true,          // return the UPDATED document (not the old one)
                runValidators: true // re-run schema validation on update
            }
        );

        if (!recipe) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recipe not found' 
            });
        }

        res.json({ success: true, data: recipe });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────
// DELETE /api/admin/recipes/:id
// Protected — permanently deletes a recipe
// ─────────────────────────────────────────
router.delete('/recipes/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);

        if (!recipe) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recipe not found' 
            });
        }

        res.json({ success: true, message: 'Recipe deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;