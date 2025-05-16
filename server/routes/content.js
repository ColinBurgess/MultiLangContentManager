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

// Get kanban board data
router.get('/kanban', async (req, res) => {
    try {
        // Obtener todos los contenidos
        const contents = await Content.find().sort({ createdAt: -1 });

        if (!contents || contents.length === 0) {
            // Si no hay contenidos, devolver array vacío
            logger.info('No contents available for kanban board');
            return res.json([]);
        }

        // Transform contents into kanban tasks
        const kanbanTasks = contents.map((content) => {
            // Determine status based on publication status
            let status;
            if (!content.publishedEs && !content.publishedEn) {
                status = 'draft'; // Not published in any language
            } else if (content.publishedEs && content.publishedEn) {
                status = 'finalizado'; // Published in both languages
            } else if (content.publishedEs) {
                status = 'castellano'; // Only published in Spanish
            } else {
                status = 'ingles'; // Only published in English
            }

            // Extraer una descripción apropiada
            const description = content.videoDescriptionEs || content.videoDescriptionEn || '';

            // Extraer tags reales o crear un array vacío
            const tags = Array.isArray(content.tags) ? content.tags : [];

            return {
                id: content._id,
                title: content.title || 'Sin título',
                description: description,
                status: status,
                dueDate: '', // No fecha límite por defecto
                contentId: content._id,
                assignee: '', // No asignado por defecto
                tags: tags,
                createdAt: content.createdAt
            };
        });

        logger.success(`Kanban data retrieved successfully. Found ${kanbanTasks.length} tasks.`);
        res.json(kanbanTasks);
    } catch (error) {
        logger.error('Error retrieving kanban data', error);
        res.status(500).json({ message: error.message });
    }
});

// Update kanban task status - IMPORTANTE: Esta ruta debe estar antes de la ruta GET /:id
router.put('/kanban/:id', async (req, res) => {
    try {
        const contentId = req.params.id;
        const { status } = req.body;

        if (!status) {
            logger.error(`Status is required for kanban update. ID: ${contentId}`);
            return res.status(400).json({ message: 'Status is required' });
        }

        // Validar que el status sea uno de los permitidos
        const validStatuses = ['draft', 'castellano', 'ingles', 'finalizado'];
        if (!validStatuses.includes(status)) {
            logger.error(`Invalid status '${status}' for kanban update. ID: ${contentId}`);
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Find the content
        const content = await Content.findById(contentId);
        if (!content) {
            logger.error(`Content not found. ID: ${contentId}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        // Guardar estado anterior para logging
        const previousState = {
            publishedEs: content.publishedEs,
            publishedEn: content.publishedEn
        };

        // Update the publication status based on the kanban status
        if (status === 'draft') {
            content.publishedEs = false;
            content.publishedEn = false;
        } else if (status === 'castellano') {
            content.publishedEs = true;
            content.publishedEn = false;
        } else if (status === 'ingles') {
            content.publishedEs = false;
            content.publishedEn = true;
        } else if (status === 'finalizado') {
            content.publishedEs = true;
            content.publishedEn = true;
        }

        // Save the updated content
        await content.save();

        const stateChange = `[ES: ${previousState.publishedEs} -> ${content.publishedEs}, EN: ${previousState.publishedEn} -> ${content.publishedEn}]`;
        logger.success(`Content kanban status updated. ID: ${contentId}, Status: ${status} ${stateChange}`);

        res.json({
            id: content._id,
            status: status,
            publishedEs: content.publishedEs,
            publishedEn: content.publishedEn
        });
    } catch (error) {
        logger.error(`Error updating content kanban status. ID: ${req.params.id}`, error);
        res.status(500).json({ message: error.message });
    }
});

// Delete kanban task - IMPORTANTE: Esta ruta debe estar antes de la ruta GET /:id
router.delete('/kanban/:id', async (req, res) => {
    try {
        const contentId = req.params.id;

        // Find the content
        const content = await Content.findById(contentId);
        if (!content) {
            logger.error(`Content not found for kanban deletion. ID: ${contentId}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        // No eliminamos el contenido real, solo restauramos su estado a borrador
        // si se quiere eliminar realmente el contenido, se debe usar el endpoint DELETE /contents/:id
        content.publishedEs = false;
        content.publishedEn = false;
        await content.save();

        logger.success(`Content kanban task removed. Content returned to draft state. ID: ${contentId}`);
        res.json({ message: 'Task removed from kanban board' });
    } catch (error) {
        logger.error(`Error removing kanban task. ID: ${req.params.id}`, error);
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