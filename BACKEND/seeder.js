// seeder.js — run this ONCE to add starter recipes to MongoDB
// How to run: node BACKEND/seeder.js
// After running, delete or keep it — it won't affect the server

const mongoose = require('mongoose');
const Recipe   = require('./models/Recipe');
require('dotenv').config();

// Our 3 starter recipes — same ones currently hardcoded in index.html
const starterRecipes = [
    {
        title:       'Creamy Tomato Pasta',
        category:    'vegan',
        description: 'A delicious creamy tomato pasta with fresh basil and parmesan cheese.',
        prepTime:    10,
        cookTime:    10,
        servings:    4,
        isFeatured:  true,   // shows on home page
        ingredients: [
            { amount: '400g',    name: 'pasta (penne or fusilli)' },
            { amount: '2 cups',  name: 'tomato sauce' },
            { amount: '1 cup',   name: 'heavy cream' },
            { amount: '3',       name: 'cloves garlic, minced' },
            { amount: '1/4 cup', name: 'fresh basil, chopped' },
            { amount: '1/2 cup', name: 'parmesan cheese, grated' },
            { amount: '2 tbsp',  name: 'olive oil' },
            { amount: '1 tsp',   name: 'Italian seasoning' },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Bring a large pot of salted water to boil and cook pasta according to package instructions.' },
            { stepNumber: 2, instruction: 'While pasta cooks, heat olive oil in a large pan over medium heat.' },
            { stepNumber: 3, instruction: 'Add minced garlic and sauté for 1 minute until fragrant.' },
            { stepNumber: 4, instruction: 'Pour in tomato sauce and Italian seasoning, simmer for 5 minutes.' },
            { stepNumber: 5, instruction: 'Reduce heat to low and stir in heavy cream. Mix well.' },
            { stepNumber: 6, instruction: 'Drain pasta and add to the sauce, tossing to coat evenly.' },
            { stepNumber: 7, instruction: 'Add fresh basil and half the parmesan, mix well.' },
            { stepNumber: 8, instruction: 'Season with salt and pepper to taste.' },
            { stepNumber: 9, instruction: 'Serve hot, garnished with remaining parmesan and extra basil.' },
        ],
    },
    {
        title:       'Vegetable Curry with Rice',
        category:    'vegetarian',
        description: 'Aromatic vegetable curry with coconut milk served over fluffy basmati rice.',
        prepTime:    15,
        cookTime:    25,
        servings:    3,
        isFeatured:  true,
        ingredients: [
            { amount: '1 cup',   name: 'basmati rice' },
            { amount: '1 can',   name: 'coconut milk' },
            { amount: '2 cups',  name: 'mixed vegetables (carrot, peas, potato)' },
            { amount: '1',       name: 'onion, diced' },
            { amount: '3',       name: 'cloves garlic, minced' },
            { amount: '2 tbsp',  name: 'curry powder' },
            { amount: '1 tbsp',  name: 'olive oil' },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Cook basmati rice according to package instructions.' },
            { stepNumber: 2, instruction: 'Heat oil in a pan, sauté onion and garlic until soft.' },
            { stepNumber: 3, instruction: 'Add curry powder and stir for 1 minute.' },
            { stepNumber: 4, instruction: 'Add vegetables and coconut milk, simmer for 20 minutes.' },
            { stepNumber: 5, instruction: 'Serve curry over rice.' },
        ],
    },
    {
        title:       'Fresh Green Salad',
        category:    'vegan',
        description: 'Crisp and refreshing garden salad with homemade vinaigrette dressing.',
        prepTime:    10,
        cookTime:    0,
        servings:    2,
        isFeatured:  true,
        ingredients: [
            { amount: '2 cups',  name: 'mixed salad greens' },
            { amount: '1',       name: 'cucumber, sliced' },
            { amount: '1 cup',   name: 'cherry tomatoes, halved' },
            { amount: '3 tbsp',  name: 'olive oil' },
            { amount: '1 tbsp',  name: 'lemon juice' },
            { amount: '1 tsp',   name: 'Dijon mustard' },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Wash and dry all vegetables.' },
            { stepNumber: 2, instruction: 'Combine greens, cucumber and tomatoes in a bowl.' },
            { stepNumber: 3, instruction: 'Whisk together olive oil, lemon juice and mustard.' },
            { stepNumber: 4, instruction: 'Drizzle dressing over salad and toss gently.' },
            { stepNumber: 5, instruction: 'Serve immediately.' },
        ],
    },
];

// Connect to MongoDB, insert recipes, then disconnect
const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        // Delete any existing recipes first to avoid duplicates
        await Recipe.deleteMany({});
        console.log('Old recipes cleared...');

        // Insert all starter recipes at once
        await Recipe.insertMany(starterRecipes);
        console.log('✅ 3 starter recipes added successfully!');

        // Always disconnect when the script is done
        mongoose.disconnect();

    } catch (error) {
        console.error('Seeder error:', error.message);
        process.exit(1);
    }
};

seedDB();