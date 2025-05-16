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

// Routes - Fixing route registration by removing trailing slashes
app.use('/api/contents', contentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

// Add diagnostics endpoint to check routes
app.get('/api/system/routes', (req, res) => {
    const routes = [];

    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes directly on the app
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods),
                layer: 'app'
            });
        } else if (middleware.name === 'router') {
            // Router middleware
            middleware.handle.stack.forEach((handler) => {
                const baseRoute = middleware.regexp.toString()
                    .replace('\\/?(?=\\/|$)', '')
                    .replace('^\\', '')
                    .replace('\\/?$', '')
                    .replace(/\\\//g, '/');

                if (handler.route) {
                    const route = handler.route.path === '/'
                        ? baseRoute
                        : baseRoute + handler.route.path;

                    routes.push({
                        path: route,
                        methods: Object.keys(handler.route.methods),
                        layer: 'router'
                    });
                }
            });
        }
    });

    res.json(routes);
});

// Direct route handler for /api/tasks as fallback
app.get('/api/tasks', async (req, res, next) => {
    // Check if request has already been handled
    if (res.headersSent) {
        return next();
    }

    try {
        // Try to get tasks directly using the mongoose model
        const Task = mongoose.model('Task');
        const tasks = await Task.find().sort({ createdAt: -1 });
        logger.success(`Found ${tasks.length} tasks via direct route`);
        res.json(tasks);
    } catch (error) {
        logger.error('Error in fallback task route', error);
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.success(`🚀 Server running on port ${PORT}`);
});