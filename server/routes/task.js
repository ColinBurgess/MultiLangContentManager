const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Content = require('../models/Content');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        logger.success('Tasks retrieved successfully');
        res.json(tasks);
    } catch (error) {
        logger.error('Error retrieving tasks', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single task
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            logger.error(`Task not found. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Task not found' });
        }
        logger.success(`Task retrieved successfully. ID: ${req.params.id}`);
        res.json(task);
    } catch (error) {
        logger.error(`Error retrieving task. ID: ${req.params.id}`, error);
        res.status(500).json({ message: error.message });
    }
});

// Create new task
router.post('/', async (req, res) => {
    try {
        // Validate contentId first
        if (!req.body.contentId) {
            logger.error('Content ID is required for task creation');
            return res.status(400).json({ message: 'Content ID is required' });
        }

        // Verify if contentId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.body.contentId)) {
            logger.error(`Invalid Content ID format: ${req.body.contentId}`);
            return res.status(400).json({ message: 'Invalid Content ID format' });
        }

        // Verify content exists
        const content = await Content.findById(req.body.contentId);
        if (!content) {
            logger.error(`Content not found for task creation. Content ID: ${req.body.contentId}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        // Prepare tags array if it's not already
        const tags = Array.isArray(req.body.tags)
            ? req.body.tags
            : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(tag => tag.trim()) : []);

        // Create task with content title
        const task = new Task({
            ...req.body,
            contentTitle: content.title,
            tags: tags
        });

        const newTask = await task.save();
        logger.success(`New task created. ID: ${newTask._id}, Title: "${newTask.title}"`);
        res.status(201).json(newTask);
    } catch (error) {
        logger.error('Error creating task', error);
        res.status(400).json({ message: error.message });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            logger.error(`Task not found for update. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        // If content ID changed, verify new content exists and update title
        if (req.body.contentId && req.body.contentId !== task.contentId.toString()) {
            // Verify if contentId is a valid ObjectId
            if (!mongoose.Types.ObjectId.isValid(req.body.contentId)) {
                logger.error(`Invalid Content ID format for task update: ${req.body.contentId}`);
                return res.status(400).json({ message: 'Invalid Content ID format' });
            }

            const content = await Content.findById(req.body.contentId);
            if (!content) {
                logger.error(`Content not found for task update. Content ID: ${req.body.contentId}`);
                return res.status(404).json({ message: 'Content not found' });
            }
            req.body.contentTitle = content.title;
        }

        // Prepare tags
        if (req.body.tags) {
            const tags = Array.isArray(req.body.tags)
                ? req.body.tags
                : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(tag => tag.trim()) : []);
            req.body.tags = tags;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        logger.success(`Task updated successfully. ID: ${req.params.id}, Title: "${updatedTask.title}"`);
        res.json(updatedTask);
    } catch (error) {
        logger.error(`Error updating task. ID: ${req.params.id}`, error);
        res.status(400).json({ message: error.message });
    }
});

// Update task status (partial update)
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            logger.error(`Status is required for task update. ID: ${req.params.id}`);
            return res.status(400).json({ message: 'Status is required' });
        }

        // Validate status is allowed
        const validStatuses = ['draft', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            logger.error(`Invalid status '${status}' for task update. ID: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            logger.error(`Task not found for status update. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update and save
        task.status = status;
        await task.save();

        logger.success(`Task status updated. ID: ${req.params.id}, Status: ${status}`);
        res.json(task);
    } catch (error) {
        logger.error(`Error updating task status. ID: ${req.params.id}`, error);
        res.status(500).json({ message: error.message });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            logger.error(`Task not found for deletion. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        await Task.findByIdAndDelete(req.params.id);
        logger.success(`Task deleted successfully. ID: ${req.params.id}`);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting task. ID: ${req.params.id}`, error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;