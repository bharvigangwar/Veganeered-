const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Recipe must have a title'],
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['vegan', 'vegetarian'],
        },
        description: {
            type: String,
            required: true,
        },
        prepTime: {
            type: Number,   // in minutes
            required: true,
        },
        cookTime: {
            type: Number,   // in minutes
            required: true,
        },
        servings: {
            type: Number,
            required: true,
        },
        ingredients: [
            {
                amount: { type: String, required: true },  // e.g. "400g"
                name:   { type: String, required: true },  // e.g. "pasta"
            }
        ],
        steps: [
            {
                stepNumber:  { type: Number, required: true },
                instruction: { type: String, required: true },
            }
        ],
        image: {
            type: String,
            default: '',
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,   // auto adds createdAt + updatedAt
    }
);

module.exports = mongoose.model('Recipe', recipeSchema);