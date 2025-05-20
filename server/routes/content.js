const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Content = require('../models/Content');
const logger = require('../../utils/logger');

// Get all contents
router.get('/', async (req, res) => {
    try {
        // Opcionalmente permitir filtrado por estado de publicación
        const filter = {};

        // Si se solicitan específicamente contenidos publicados
        if (req.query.published === 'true') {
            filter.$or = [
                { publishedEs: true },
                { publishedEn: true }
            ];
        } else if (req.query.published === 'false') {
            filter.publishedEs = false;
            filter.publishedEn = false;
        }

        const contents = await Content.find(filter).sort({ createdAt: -1 });
        logger.success(`Contents retrieved successfully. Count: ${contents.length}`);
        res.json(contents);
    } catch (error) {
        logger.error('Error retrieving contents', error);
        // Incluir detalles en desarrollo
        res.status(500).json({
            message: 'Error retrieving contents',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get kanban board data
router.get('/kanban', async (req, res) => {
    try {
        // Obtener todos los contenidos
        const contents = await Content.find().sort({ createdAt: -1 });

        if (!contents || contents.length === 0) {
            // Si no hay contenidos, devolver array vacío
            logger.success('No contents available for kanban board');
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
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            logger.error(`Invalid content ID format for kanban: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid content ID format' });
        }

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
        // Verificar que el parámetro de búsqueda exista
        if (!req.query.q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Sanitizar la consulta de búsqueda
        const query = String(req.query.q).toLowerCase();

        // Escapar caracteres especiales para evitar inyección de regex
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const contents = await Content.find({
            $or: [
                { title: { $regex: safeQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(safeQuery, 'i')] } },
                { descriptionEs: { $regex: safeQuery, $options: 'i' } },
                { descriptionEn: { $regex: safeQuery, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 }).limit(100); // Limitar resultados para prevenir DoS

        logger.success(`Search completed successfully. Query: "${query}"`);
        res.json(contents);
    } catch (error) {
        logger.error(`Error during search. Query: "${req.query.q || ''}"`, error);
        res.status(500).json({
            message: 'Error processing search request',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            query: req.query.q || ''
        });
    }
});

// Get single content
router.get('/:id', async (req, res) => {
    try {
        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            logger.error(`Invalid content ID format: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid content ID format' });
        }

        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }
        logger.success(`Content retrieved successfully. ID: ${req.params.id}`);
        res.json(content);
    } catch (error) {
        logger.error(`Error retrieving content. ID: ${req.params.id}`, error);
        // Mantener el mensaje de error para facilitar depuración
        res.status(500).json({ message: 'Error retrieving content', details: error.message });
    }
});

// Create new content
router.post('/', async (req, res) => {
    try {
        // Validar campos obligatorios
        if (!req.body.title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Sanitizar campos de entrada
        const sanitizedInput = {
            title: String(req.body.title).trim()
        };

        // Lista de campos permitidos para evitar inyección de propiedades no deseadas
        const allowedFields = [
            'publishedEs', 'publishedEn', 'publishedDateEs', 'publishedDateEn',
            'publishedUrlEs', 'publishedUrlEn', 'teleprompterEs', 'teleprompterEn',
            'videoDescriptionEs', 'videoDescriptionEn', 'tagsListEs', 'tagsListEn',
            'pinnedCommentEs', 'pinnedCommentEn', 'tiktokDescriptionEs', 'tiktokDescriptionEn',
            'twitterPostEs', 'twitterPostEn', 'facebookDescriptionEs', 'facebookDescriptionEn'
        ];

        // Copiar solo los campos permitidos después de santizarlos
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // Convertir a String solo si no es un booleano o fecha
                if (field.startsWith('published') && typeof req.body[field] === 'boolean') {
                    sanitizedInput[field] = Boolean(req.body[field]);
                } else if (field.includes('Date') && !isNaN(new Date(req.body[field]))) {
                    sanitizedInput[field] = new Date(req.body[field]);
                } else {
                    sanitizedInput[field] = String(req.body[field]);
                }
            }
        });

        // Prepare tags: use as array if already array, otherwise convert and sanitize
        const rawTags = Array.isArray(req.body.tags)
            ? req.body.tags
            : (typeof req.body.tags === 'string' ? req.body.tags.split(',') : []);

        // Sanitizar cada tag
        const tags = rawTags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);

        const content = new Content({
            ...sanitizedInput,
            tags: tags
        });

        const newContent = await content.save();
        logger.success(`New content created. ID: ${newContent._id}, Title: "${newContent.title}"`);
        res.status(201).json(newContent);
    } catch (error) {
        logger.error('Error creating content', error);
        res.status(400).json({ message: 'Error creating content' }); // No exponer el mensaje de error específico
    }
});

// Update content
router.put('/:id', async (req, res) => {
    try {
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            logger.error(`Invalid content ID format: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid content ID format' });
        }

        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found for update. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        // Sanitizar campos de entrada
        const sanitizedInput = {};

        // Actualizar el título si se proporciona
        if (req.body.title) {
            sanitizedInput.title = String(req.body.title).trim();
        }

        // Lista de campos permitidos para evitar inyección de propiedades no deseadas
        const allowedFields = [
            'publishedEs', 'publishedEn', 'publishedDateEs', 'publishedDateEn',
            'publishedUrlEs', 'publishedUrlEn', 'teleprompterEs', 'teleprompterEn',
            'videoDescriptionEs', 'videoDescriptionEn', 'tagsListEs', 'tagsListEn',
            'pinnedCommentEs', 'pinnedCommentEn', 'tiktokDescriptionEs', 'tiktokDescriptionEn',
            'twitterPostEs', 'twitterPostEn', 'facebookDescriptionEs', 'facebookDescriptionEn'
        ];

        // Copiar solo los campos permitidos después de santizarlos
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // Convertir a String solo si no es un booleano o fecha
                if (field.startsWith('published') && typeof req.body[field] === 'boolean') {
                    sanitizedInput[field] = Boolean(req.body[field]);
                } else if (field.includes('Date') && !isNaN(new Date(req.body[field]))) {
                    sanitizedInput[field] = new Date(req.body[field]);
                } else {
                    sanitizedInput[field] = String(req.body[field]);
                }
            }
        });

        // Prepare tags: use as array if already array, otherwise convert and sanitize
        if (req.body.tags !== undefined) {
            const rawTags = Array.isArray(req.body.tags)
                ? req.body.tags
                : (typeof req.body.tags === 'string' ? req.body.tags.split(',') : []);

            // Sanitizar cada tag
            sanitizedInput.tags = rawTags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
        }

        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { $set: sanitizedInput },
            { new: true, runValidators: true }
        );

        logger.success(`Content updated successfully. ID: ${req.params.id}, Title: "${updatedContent.title}"`);
        res.json(updatedContent);
    } catch (error) {
        logger.error(`Error updating content. ID: ${req.params.id}`, error);

        // Determinar tipo de error
        let statusCode = 400;
        let errorMessage = 'Error updating content';

        if (error.name === 'ValidationError') {
            errorMessage = 'Validation error occurred';
        } else if (error.name === 'CastError') {
            errorMessage = 'Invalid data format';
        }

        res.status(statusCode).json({
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            id: req.params.id
        });
    }
});

// Update publication status
router.patch('/:id', async (req, res) => {
    try {
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            logger.error(`Invalid content ID format: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid content ID format' });
        }

        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found for status update. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        // Lista de campos permitidos para actualización parcial
        const allowedFields = ['publishedEs', 'publishedEn', 'publishedDateEs', 'publishedDateEn'];
        const updateData = {};

        // Verificar y procesar solo campos permitidos para actualización de estado
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                // Procesamiento específico según el tipo de campo
                if (field.startsWith('published') && !field.includes('Date')) {
                    // Campos booleanos de publicación
                    updateData[field] = Boolean(req.body[field]);

                    // Si se publica, actualizar automáticamente la fecha
                    if (updateData[field] === true) {
                        const dateField = `${field.replace('published', 'publishedDate')}`;
                        updateData[dateField] = new Date();
                    }
                } else if (field.includes('Date')) {
                    // Campos de fecha
                    if (req.body[field]) {
                        updateData[field] = new Date(req.body[field]);
                    } else {
                        updateData[field] = null;
                    }
                }
            }
        }

        // Si no hay campos válidos para actualizar, retornar error
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Determinar el campo y estado para el registro de log
        const statusField = Object.keys(updateData)[0];
        const language = statusField.replace('published', '');
        const status = updateData[statusField] ? 'published' : 'pending';
        logger.success(`Publication status updated: ${language} - ${status}. ID: ${req.params.id}`);

        res.json(updatedContent);
    } catch (error) {
        logger.error(`Error updating publication status. ID: ${req.params.id}`, error);
        res.status(400).json({ message: 'Error updating status' }); // No exponer el mensaje de error específico
    }
});

// Delete content
router.delete('/:id', async (req, res) => {
    try {
        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            logger.error(`Invalid content ID format for deletion: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid content ID format' });
        }

        const content = await Content.findById(req.params.id);
        if (!content) {
            logger.error(`Content not found for deletion. ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Content not found' });
        }

        await content.deleteOne();
        logger.success(`Content deleted successfully. ID: ${req.params.id}, Title: "${content.title}"`);
        res.json({ message: 'Content deleted', id: req.params.id });
    } catch (error) {
        logger.error(`Error deleting content. ID: ${req.params.id}`, error);
        // Incluir detalles del error para facilitar depuración
        res.status(500).json({
            message: 'Error deleting content',
            details: error.message
        });
    }
});

module.exports = router;