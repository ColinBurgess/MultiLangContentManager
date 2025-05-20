require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Content = require('../models/Content');
const Task = require('../models/Task');
const { getMongoDBUri } = require('../../utils/credentials');
const logger = require('../../utils/logger');

// Map the old status values to new ones
const statusMap = {
    'draft': 'draft',
    'spanish': 'in-progress',
    'english': 'in-progress',
    'completed': 'done'
};

async function migrateContentToTasks() {
    try {
        // Connect to MongoDB
        const uri = getMongoDBUri();
        await mongoose.connect(uri);
        logger.success('Connected to MongoDB');

        // Get all contents
        const contents = await Content.find();
        logger.success(`Found ${contents.length} contents to migrate`);

        // Process each content
        for (const content of contents) {
            // Determine old status
            let oldStatus;
            if (!content.publishedEs && !content.publishedEn) {
                oldStatus = 'draft';
            } else if (content.publishedEs && content.publishedEn) {
                oldStatus = 'completed';
            } else if (content.publishedEs) {
                oldStatus = 'spanish';
            } else {
                oldStatus = 'english';
            }

            // Check if task already exists for this content
            const existingTask = await Task.findOne({ contentId: content._id });

            if (existingTask) {
                logger.success(`Task already exists for content: ${content.title} (${content._id})`);
                continue;
            }

            // Create description based on the content status
            let taskDescription;
            if (oldStatus === 'draft') {
                taskDescription = 'Prepare and record content in both languages.';
            } else if (oldStatus === 'spanish') {
                taskDescription = 'Content already published in Spanish. Pending English version recording.';
            } else if (oldStatus === 'english') {
                taskDescription = 'Content already published in English. Pending Spanish version recording.';
            } else {
                taskDescription = 'Review and verify the quality of both published versions.';
            }

            // Create a new task for this content
            const task = new Task({
                title: `Gestionar: ${content.title}`,
                description: taskDescription,
                status: statusMap[oldStatus],
                contentId: content._id,
                contentTitle: content.title,
                tags: content.tags || [],
                createdAt: content.createdAt
            });

            await task.save();
            logger.success(`Created task for content: ${content.title} (${content._id})`);
        }

        logger.success('Migration completed successfully');
    } catch (error) {
        logger.error('Error during migration:', error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        logger.success('Disconnected from MongoDB');
    }
}

// Run the migration
migrateContentToTasks()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Unhandled error during migration:', error);
        process.exit(1);
    });