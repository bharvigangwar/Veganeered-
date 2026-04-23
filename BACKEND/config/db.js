const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);   // stop the server if DB fails
    }
};

module.exports = connectDB;
//  What is process.exit(1)? It forcefully stops Node.js with an error code. If the DB can't connect, there's no point running the server.