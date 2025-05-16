require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { getMongoDBUri } = require('../utils/credentials');
const contentRoutes = require('./routes/content');
const taskRoutes = require('./routes/task');
const logRoutes = require('./routes/logs');
const logger = require('../utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// MongoDB Connection
async function connectToMongoDB() {
    try {
        const uri = getMongoDBUri();
        await mongoose.connect(uri);
        logger.success('✅ Successfully connected to MongoDB');
    } catch (error) {
        logger.error('❌ Error connecting to MongoDB', error);
        process.exit(1);
    }
}

connectToMongoDB();

// Routes
app.use('/api/contents', contentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.success(`🚀 Server running on port ${PORT}`);
});