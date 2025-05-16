const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const logger = require('../../utils/logger');

// Get all contents
router.get('/', async (req, res) => {
    try {
        const contents = await Content.find().sort({ createdAt: -1 });
        logger.success('Contents retrieved successfully');
        res.json(contents);
    } catch (error) {
        logger.error('Error retrieving contents', error);
        res.status(500).json({ message: error.message });
    }
});

// Search contents
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q.toLowerCase();
        const contents = await Content.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } },
                { descriptionEs: { $regex: query, $options: 'i' } },
                { descriptionEn: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        logger.success(`Search completed successfully. Query: "${query}"`);
        res.json(contents);
    } catch (error) {
        logger.error(`Error during search. Query: "${req.query.q}"`, error);
        res.status(500).json({ message: error.message });
    }
});

// Get single content
router.get('/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }
        logger.success(`Content retrieved successfully. ID: ${req.params.id}`);
        res.json(content);
    } catch (error) {
        logger.error(`Error retrieving content. ID: ${req.params.id}`, error);
        res.status(500).json({ message: error.message });
    }
});

// Create new content
router.post('/', async (req, res) => {
    try {
        // Prepare tags: use as array if already array, otherwise convert
        const tags = Array.isArray(req.body.tags)
            ? req.body.tags
            : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(tag => tag.trim()) : []);

        const content = new Content({
            ...req.body,
            tags: tags
        });
        const newContent = await content.save();
        logger.success(`New content created. ID: ${newContent._id}, Title: "${newContent.title}"`);
        res.status(201).json(newContent);
    } catch (error) {
        logger.error('Error creating content', error);
        res.status(400).json({ message: error.message });
    }
});

// Update content
router.put('/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found for update. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        // Prepare tags: use as array if already array, otherwise convert
        const tags = Array.isArray(req.body.tags)
            ? req.body.tags
            : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(tag => tag.trim()) : []);

        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                tags: tags
            },
            { new: true }
        );
        logger.success(`Content updated successfully. ID: ${req.params.id}, Title: "${updatedContent.title}"`);
        res.json(updatedContent);
    } catch (error) {
        logger.error(`Error updating content. ID: ${req.params.id}`, error);
        res.status(400).json({ message: error.message });
    }
});

// Update publication status
router.patch('/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found for status update. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        const statusField = Object.keys(req.body)[0];
        const language = statusField.replace('published', '');
        const status = req.body[statusField] ? 'published' : 'pending';
        logger.success(`Publication status updated: ${language} - ${status}. ID: ${req.params.id}`);

        res.json(updatedContent);
    } catch (error) {
        logger.error(`Error updating publication status. ID: ${req.params.id}`, error);
        res.status(400).json({ message: error.message });
    }
});

// Delete content
router.delete('/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found for deletion. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }
        await content.deleteOne();
        logger.success(`Content deleted successfully. ID: ${req.params.id}, Title: "${content.title}"`);
        res.json({ message: 'Content deleted' });
    } catch (error) {
        logger.error(`Error deleting content. ID: ${req.params.id}`, error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;