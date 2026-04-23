const express  = require('express');
const router   = express.Router();
const Recipe   = require('../models/Recipe');

// GET /api/recipes — get all recipes (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { category, maxPrepTime } = req.query;
        //  What is req.query? When someone visits /api/recipes?category=vegan&maxPrepTime=30, 
        // the category and maxPrepTime values land in req.query. 
        // This is how filtering works without extra routes.
        let filter = {};

        if (category)    filter.category  = category;
if (maxPrepTime) filter.prepTime  = { $lte: Number(maxPrepTime) };
if (req.query.isFeatured === 'true') filter.isFeatured = true;
        //  What is $lte? It's a MongoDB operator meaning "less than or equal to". 
        //  So prepTime: { $lte: 30 } finds all recipes that take 30 minutes or less to prep.

        const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: recipes.length, data: recipes });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/recipes/:id — get single recipe
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }
        res.json({ success: true, data: recipe });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;