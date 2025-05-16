require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { getMongoDBUri } = require('../utils/credentials');
const contentRoutes = require('./routes/content');
const taskRoutes = require('./routes/task');
const logRoutes = require('./routes/logs');
const logger = require('../utils/logger');

// Create a test app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// Routes
app.use('/api/contents', contentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

// Helper function to print routes
function printRoutes(app) {
    console.log('\n======= REGISTERED ROUTES =======');

    const routes = [];

    // Get router stack
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Route directly on the app
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods).join(', ')
            });
        } else if (middleware.name === 'router') {
            // Router middleware
            middleware.handle.stack.forEach((handler) => {
                const baseRoute = middleware.regexp.toString()
                    .replace('\\/?(?=\\/|$)', '')
                    .replace('^\\', '')
                    .replace('\\/?$', '')
                    .replace(/\\\//g, '/');

                let route = '';

                if (handler.route) {
                    route = handler.route.path;
                    if (baseRoute !== '/') {
                        route = baseRoute + route;
                    }

                    routes.push({
                        path: route,
                        methods: Object.keys(handler.route.methods).join(', ')
                    });
                }
            });
        }
    });

    // Sort and print routes
    routes.sort((a, b) => a.path.localeCompare(b.path));
    routes.forEach((route) => {
        console.log(`${route.methods.toUpperCase()}\t${route.path}`);
    });

    console.log('\n=================================');
}

// Test direct import of task.js routes
console.log('Checking task routes module:');
console.log('- Task routes type:', typeof taskRoutes);
console.log('- Is it a function?', typeof taskRoutes === 'function');
console.log('- Does it have a stack?', taskRoutes.stack ? 'Yes' : 'No');

if (taskRoutes.stack) {
    console.log('- Number of route handlers:', taskRoutes.stack.length);

    // Print route details
    taskRoutes.stack.forEach((handler, i) => {
        if (handler.route) {
            console.log(`  [${i}] ${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
        } else {
            console.log(`  [${i}] Middleware: ${handler.name}`);
        }
    });
}

// Check if task.js file exists and print its contents
const taskRoutesPath = path.join(__dirname, 'routes/task.js');
if (fs.existsSync(taskRoutesPath)) {
    console.log('\nTask route file exists!');

    // Print file stats
    const stats = fs.statSync(taskRoutesPath);
    console.log('- File size:', stats.size, 'bytes');
    console.log('- Last modified:', stats.mtime);

    // Read file content
    const content = fs.readFileSync(taskRoutesPath, 'utf8');
    console.log('- File content length:', content.length, 'characters');
    console.log('- Contains "router.get":', content.includes('router.get'));
    console.log('- Contains "router.post":', content.includes('router.post'));
} else {
    console.log('\nWARNING: task.js file not found at', taskRoutesPath);
}

// Print all registered routes
printRoutes(app);

// Function to test MongoDB connection
async function testConnection() {
    try {
        const uri = getMongoDBUri();
        console.log('\nConnecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ Successfully connected to MongoDB');

        // Check if Task model is registered
        const models = mongoose.modelNames();
        console.log('\nRegistered models:', models);

        if (models.includes('Task')) {
            const Task = mongoose.model('Task');
            console.log('- Task model exists!');

            // Count tasks
            const count = await Task.countDocuments();
            console.log(`- There are ${count} tasks in the database`);

            if (count > 0) {
                // Fetch a sample task
                const task = await Task.findOne();
                console.log('- Sample task:', {
                    id: task._id,
                    title: task.title,
                    status: task.status
                });
            }
        } else {
            console.log('- Task model does not exist in Mongoose');
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
    }
}

// Run the test
testConnection().then(() => {
    console.log('\nDiagnosis completed');
});