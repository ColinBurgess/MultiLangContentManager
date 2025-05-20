const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');
const logger = require('../../utils/logger');

// Get all prompts
router.get('/', async (req, res) => {
    try {
        // Apply search filter if provided
        let query = {};
        if (req.query.search) {
            query = { $text: { $search: req.query.search } };
        }

        // Apply tag filter if provided
        if (req.query.tag) {
            query.tags = req.query.tag;
        }

        // Set up sorting
        let sort = { createdAt: -1 }; // default: newest first
        if (req.query.sort === 'title') {
            sort = { title: 1 };
        } else if (req.query.sort === 'updated') {
            sort = { updatedAt: -1 };
        }

        console.log('Attempting to retrieve prompts...');
        const prompts = await Prompt.find(query).sort(sort);

        console.log(`Retrieved ${prompts ? prompts.length : 0} prompts`);
        res.json(prompts || []);
    } catch (error) {
        console.error('Error retrieving prompts:', error);
        logger.error('Error retrieving prompts', error);
        res.status(500).json({ message: 'Server error while retrieving prompts' });
    }
});

// Get a single prompt by ID
router.get('/:id', async (req, res) => {
    try {
        const prompt = await Prompt.findById(req.params.id);

        if (!prompt) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        res.json(prompt);
    } catch (error) {
        logger.error(`Error retrieving prompt with id ${req.params.id}`, error);
        res.status(500).json({ message: 'Server error while retrieving prompt' });
    }
});

// Create a new prompt
router.post('/', async (req, res) => {
    try {
        // Extract prompt data from request body
        const { title, body, description, tags } = req.body;

        // Basic validation
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        // Create new prompt
        const newPrompt = new Prompt({
            title,
            body,
            description: description || '',
            tags: tags || []
        });

        // Save to database
        const savedPrompt = await newPrompt.save();

        logger.success(`Created new prompt: ${title}`);
        res.status(201).json(savedPrompt);
    } catch (error) {
        logger.error('Error creating prompt', error);
        res.status(500).json({ message: 'Server error while creating prompt' });
    }
});

// Update an existing prompt
router.put('/:id', async (req, res) => {
    try {
        const { title, body, description, tags } = req.body;

        // Basic validation
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        // Find and update the prompt
        const updatedPrompt = await Prompt.findByIdAndUpdate(
            req.params.id,
            {
                title,
                body,
                description: description || '',
                tags: tags || [],
                updatedAt: Date.now()
            },
            { new: true } // Return the updated document
        );

        if (!updatedPrompt) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        logger.success(`Updated prompt: ${title}`);
        res.json(updatedPrompt);
    } catch (error) {
        logger.error(`Error updating prompt with id ${req.params.id}`, error);
        res.status(500).json({ message: 'Server error while updating prompt' });
    }
});

// Delete a prompt
router.delete('/:id', async (req, res) => {
    try {
        const deletedPrompt = await Prompt.findByIdAndDelete(req.params.id);

        if (!deletedPrompt) {
            return res.status(404).json({ message: 'Prompt not found' });
        }

        logger.success(`Deleted prompt: ${deletedPrompt.title}`);
        res.json({ message: 'Prompt deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting prompt with id ${req.params.id}`, error);
        res.status(500).json({ message: 'Server error while deleting prompt' });
    }
});

module.exports = router;