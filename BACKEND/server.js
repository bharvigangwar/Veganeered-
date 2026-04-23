const express = require('express');
const cors =require('cors');
const path = require('path');
require('dotenv').config();

const connectDB=require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());                              // parse JSON request bodies
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Routes (we'll add these in the next commits)
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/admin',   require('./routes/admin'));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});