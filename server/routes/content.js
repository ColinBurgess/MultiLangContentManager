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

        // Asegurarse de que todos los contenidos tengan statusEs y statusEn
        const processedContents = contents.map(content => {
            const contentObj = content.toObject();

            // Si no existe statusEs, derivarlo de publishedEs
            if (!contentObj.statusEs) {
                contentObj.statusEs = contentObj.publishedEs ? 'published' : 'pending';
            }

            // Si no existe statusEn, derivarlo de publishedEn
            if (!contentObj.statusEn) {
                contentObj.statusEn = contentObj.publishedEn ? 'published' : 'pending';
            }

            return contentObj;
        });

        logger.success(`Contents retrieved successfully. Count: ${processedContents.length}`);
        res.json(processedContents);
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

        // Convertir a objeto para poder modificar
        const contentObj = content.toObject();

        // Asegurar que statusEs y statusEn están establecidos
        if (!contentObj.statusEs) {
            contentObj.statusEs = contentObj.publishedEs ? 'published' : 'pending';
        }

        if (!contentObj.statusEn) {
            contentObj.statusEn = contentObj.publishedEn ? 'published' : 'pending';
        }

        logger.success(`Content retrieved successfully. ID: ${req.params.id}`);
        res.json(contentObj);
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
            'twitterPostEs', 'twitterPostEn', 'facebookDescriptionEs', 'facebookDescriptionEn',
            'statusEs', 'statusEn'
        ];

        // Copiar solo los campos permitidos después de santizarlos
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // Convertir a String solo si no es un booleano o fecha
                if (field.startsWith('published') && typeof req.body[field] === 'boolean') {
                    sanitizedInput[field] = Boolean(req.body[field]);
                } else if (field.includes('Date') && !isNaN(new Date(req.body[field]))) {
                    sanitizedInput[field] = new Date(req.body[field]);
                } else if (field === 'statusEs' || field === 'statusEn') {
                    // Validar que el valor esté entre los permitidos
                    const validStatuses = ['pending', 'in-progress', 'published'];
                    const status = String(req.body[field]);
                    sanitizedInput[field] = validStatuses.includes(status) ? status : 'pending';

                    // Actualizar publishedEs/publishedEn en función del status
                    if (field === 'statusEs') {
                        sanitizedInput.publishedEs = (status === 'published');
                    } else if (field === 'statusEn') {
                        sanitizedInput.publishedEn = (status === 'published');
                    }
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

        // Handle platformStatus data for new content
        let platformStatus = {};
        if (req.body.platformStatus && typeof req.body.platformStatus === 'object') {
            logger.success(`Processing platformStatus for new content: ${JSON.stringify(req.body.platformStatus)}`);

            const validPlatforms = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];
            const validStatuses = ['pending', 'in-progress', 'published'];

            // Process each platform
            Object.keys(req.body.platformStatus).forEach(platform => {
                if (validPlatforms.includes(platform)) {
                    const platformData = req.body.platformStatus[platform];

                    platformStatus[platform] = {};

                    // Set platform fields with defaults
                    platformStatus[platform].statusEs = validStatuses.includes(String(platformData.statusEs)) ? String(platformData.statusEs) : 'pending';
                    platformStatus[platform].statusEn = validStatuses.includes(String(platformData.statusEn)) ? String(platformData.statusEn) : 'pending';
                    platformStatus[platform].urlEs = platformData.urlEs ? String(platformData.urlEs) : '';
                    platformStatus[platform].urlEn = platformData.urlEn ? String(platformData.urlEn) : '';
                    platformStatus[platform].publishedDateEs = platformData.publishedDateEs ? new Date(platformData.publishedDateEs) : null;
                    platformStatus[platform].publishedDateEn = platformData.publishedDateEn ? new Date(platformData.publishedDateEn) : null;

                    logger.success(`Setting new content ${platform}.urlEs to: "${platformStatus[platform].urlEs}"`);
                }
            });
        }

        const content = new Content({
            ...sanitizedInput,
            tags: tags,
            platformStatus: platformStatus
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

        // Log detallado de la solicitud para debug
        logger.success(`PUT request received for ID: ${req.params.id}`);
        logger.success(`Request body: ${JSON.stringify(req.body)}`);

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
            'twitterPostEs', 'twitterPostEn', 'facebookDescriptionEs', 'facebookDescriptionEn',
            'statusEs', 'statusEn'
        ];

        // Guardar valores originales para comparación
        const originalValues = {
            publishedEs: content.publishedEs,
            publishedEn: content.publishedEn,
            statusEs: content.statusEs,
            statusEn: content.statusEn
        };

        // Procesar primero los campos de status para garantizar la correcta sincronización
        if (req.body.statusEs !== undefined) {
            const validStatuses = ['pending', 'in-progress', 'published'];
            const statusEs = String(req.body.statusEs);
            sanitizedInput.statusEs = validStatuses.includes(statusEs) ? statusEs : 'pending';

            // Actualizar publishedEs en función del status
            sanitizedInput.publishedEs = (statusEs === 'published');

            // Si está publicado y no tiene fecha, actualizar la fecha de publicación
            if (statusEs === 'published' && !content.publishedDateEs) {
                sanitizedInput.publishedDateEs = new Date();
            }

            logger.success(`Procesando statusEs: ${statusEs} -> published=${sanitizedInput.publishedEs}`);
        }

        if (req.body.statusEn !== undefined) {
            const validStatuses = ['pending', 'in-progress', 'published'];
            const statusEn = String(req.body.statusEn);
            sanitizedInput.statusEn = validStatuses.includes(statusEn) ? statusEn : 'pending';

            // Actualizar publishedEn en función del status
            sanitizedInput.publishedEn = (statusEn === 'published');

            // Si está publicado y no tiene fecha, actualizar la fecha de publicación
            if (statusEn === 'published' && !content.publishedDateEn) {
                sanitizedInput.publishedDateEn = new Date();
            }

            logger.success(`Procesando statusEn: ${statusEn} -> published=${sanitizedInput.publishedEn}`);
        }

        // Si se especificó explícitamente publishedEs/En, usar ese valor (más prioritario que el derivado del status)
        if (typeof req.body.publishedEs === 'boolean') {
            sanitizedInput.publishedEs = Boolean(req.body.publishedEs);

            // Sincronizar el status si published cambia pero status no fue especificado
            if (req.body.statusEs === undefined) {
                sanitizedInput.statusEs = sanitizedInput.publishedEs ? 'published' :
                                         (content.statusEs === 'published' ? 'pending' : content.statusEs || 'pending');
            }
        }

        if (typeof req.body.publishedEn === 'boolean') {
            sanitizedInput.publishedEn = Boolean(req.body.publishedEn);

            // Sincronizar el status si published cambia pero status no fue especificado
            if (req.body.statusEn === undefined) {
                sanitizedInput.statusEn = sanitizedInput.publishedEn ? 'published' :
                                         (content.statusEn === 'published' ? 'pending' : content.statusEn || 'pending');
            }
        }

        // Copiar el resto de los campos permitidos después de santizarlos
        allowedFields.forEach(field => {
            // Saltar los campos de status y published que ya se procesaron
            if (field === 'statusEs' || field === 'statusEn' ||
                field === 'publishedEs' || field === 'publishedEn') {
                return;
            }

            if (req.body[field] !== undefined) {
                // Convertir a String solo si no es una fecha
                if (field.includes('Date') && !isNaN(new Date(req.body[field]))) {
                    sanitizedInput[field] = new Date(req.body[field]);
                } else {
                    sanitizedInput[field] = String(req.body[field]);
                }
            }
        });

        // Handle platformStatus data
        if (req.body.platformStatus && typeof req.body.platformStatus === 'object') {
            logger.success(`Processing platformStatus: ${JSON.stringify(req.body.platformStatus)}`);

            const validPlatforms = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];
            const validStatuses = ['pending', 'in-progress', 'published'];

            // Initialize platformStatus if it doesn't exist
            if (!content.platformStatus) {
                content.platformStatus = {};
            }

            // Process each platform
            Object.keys(req.body.platformStatus).forEach(platform => {
                if (validPlatforms.includes(platform)) {
                    const platformData = req.body.platformStatus[platform];

                    // Initialize platform data if it doesn't exist
                    if (!content.platformStatus[platform]) {
                        content.platformStatus[platform] = {};
                    }

                    // Update platform fields
                    if (platformData.statusEs !== undefined) {
                        const status = String(platformData.statusEs);
                        content.platformStatus[platform].statusEs = validStatuses.includes(status) ? status : 'pending';
                    }

                    if (platformData.statusEn !== undefined) {
                        const status = String(platformData.statusEn);
                        content.platformStatus[platform].statusEn = validStatuses.includes(status) ? status : 'pending';
                    }

                    if (platformData.urlEs !== undefined) {
                        content.platformStatus[platform].urlEs = String(platformData.urlEs);
                        logger.success(`Setting ${platform}.urlEs to: "${platformData.urlEs}"`);
                    }

                    if (platformData.urlEn !== undefined) {
                        content.platformStatus[platform].urlEn = String(platformData.urlEn);
                    }

                    if (platformData.publishedDateEs !== undefined) {
                        content.platformStatus[platform].publishedDateEs = platformData.publishedDateEs ? new Date(platformData.publishedDateEs) : null;
                    }

                    if (platformData.publishedDateEn !== undefined) {
                        content.platformStatus[platform].publishedDateEn = platformData.publishedDateEn ? new Date(platformData.publishedDateEn) : null;
                    }
                }
            });

            // Mark platformStatus as modified for Mongoose to detect the change
            content.markModified('platformStatus');
        }

        // Prepare tags: use as array if already array, otherwise convert and sanitize
        if (req.body.tags !== undefined) {
            const rawTags = Array.isArray(req.body.tags)
                ? req.body.tags
                : (typeof req.body.tags === 'string' ? req.body.tags.split(',') : []);

            // Sanitizar cada tag
            sanitizedInput.tags = rawTags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
        }

        // Log de los campos que se van a actualizar
        logger.success(`Fields to update: ${JSON.stringify(sanitizedInput)}`);

        // Aplicar los cambios directamente al objeto encontrado
        Object.keys(sanitizedInput).forEach(key => {
            content[key] = sanitizedInput[key];
        });

        // Guardar el documento usando save() para asegurar que se activen los hooks y validaciones
        await content.save();

        // Verificar resultado de la actualización
        logger.success(`Document saved with _id: ${content._id}`);

        // Crear un log detallado de los cambios
        let changesLog = [];
        if (originalValues.statusEs !== content.statusEs) {
            changesLog.push(`statusEs: ${originalValues.statusEs || 'undefined'} -> ${content.statusEs || 'undefined'}`);
        }
        if (originalValues.statusEn !== content.statusEn) {
            changesLog.push(`statusEn: ${originalValues.statusEn || 'undefined'} -> ${content.statusEn || 'undefined'}`);
        }
        if (originalValues.publishedEs !== content.publishedEs) {
            changesLog.push(`publishedEs: ${originalValues.publishedEs} -> ${content.publishedEs}`);
        }
        if (originalValues.publishedEn !== content.publishedEn) {
            changesLog.push(`publishedEn: ${originalValues.publishedEn} -> ${content.publishedEn}`);
        }

        if (changesLog.length > 0) {
            logger.success(`Content updated with changes: ${changesLog.join(', ')}. ID: ${req.params.id}`);
        } else {
            logger.error(`⚠️ No changes detected after update! ID: ${req.params.id}`);
        }

        res.json(content);
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
        const allowedFields = ['publishedEs', 'publishedEn', 'publishedDateEs', 'publishedDateEn', 'statusEs', 'statusEn'];
        const updateData = {};

        // Log de datos recibidos para depuración
        logger.success(`PATCH request received. ID: ${req.params.id}, Body: ${JSON.stringify(req.body)}`);

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
                } else if (field === 'statusEs' || field === 'statusEn') {
                    // Validar que el valor esté entre los permitidos
                    const validStatuses = ['pending', 'in-progress', 'published'];
                    const status = String(req.body[field]);
                    if (!validStatuses.includes(status)) {
                        logger.error(`Invalid status value: ${status} for field ${field}. ID: ${req.params.id}`);
                        return res.status(400).json({
                            message: 'Invalid status value',
                            field: field,
                            value: status,
                            valid: validStatuses
                        });
                    }

                    updateData[field] = status;

                    // Actualizar publishedEs/publishedEn en función del status
                    if (field === 'statusEs') {
                        updateData.publishedEs = (status === 'published');

                        // Si se publica, actualizar automáticamente la fecha
                        if (status === 'published') {
                            updateData.publishedDateEs = new Date();
                        }
                    } else if (field === 'statusEn') {
                        updateData.publishedEn = (status === 'published');

                        // Si se publica, actualizar automáticamente la fecha
                        if (status === 'published') {
                            updateData.publishedDateEn = new Date();
                        }
                    }
                }
            }
        }

        // Si no hay campos válidos para actualizar, retornar error
        if (Object.keys(updateData).length === 0) {
            logger.error(`No valid fields to update. ID: ${req.params.id}, Body: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: 'No valid fields to update',
                received: req.body,
                allowed: allowedFields
            });
        }

        // Log de los datos que se actualizarán
        logger.success(`Updating content with: ${JSON.stringify(updateData)}. ID: ${req.params.id}`);

        // Usar save() en lugar de findByIdAndUpdate para asegurar que se activen hooks y validaciones
        Object.keys(updateData).forEach(key => {
            content[key] = updateData[key];
        });

        await content.save();

        // Log detallado de los cambios realizados
        const changesLog = Object.keys(updateData).map(field =>
            `${field}: ${content[field]}`
        ).join(', ');

        logger.success(`Content updated successfully. Updated fields: ${changesLog}. ID: ${req.params.id}`);

        res.json(content);
    } catch (error) {
        logger.error(`Error updating publication status. ID: ${req.params.id}`, error);
        res.status(400).json({
            message: 'Error updating status',
            error: error.message,
            id: req.params.id
        });
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