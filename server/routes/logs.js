const express = require('express');
const router = express.Router();
const { saveThemeLog, getThemeLogs } = require('../logService');
const logger = require('../../utils/logger');

// Save theme log
router.post('/theme', async (req, res) => {
    try {
        // Validar que el cuerpo de la solicitud exista
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ success: false, message: 'Formato de log inválido' });
        }

        // Crear un nuevo objeto de log con solo los campos permitidos
        const logEntry = {};

        // Lista de campos permitidos
        const allowedFields = ['level', 'message', 'page', 'timestamp', 'theme', 'event'];

        // Copiar solo los campos permitidos
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // Asegurar que sean strings para evitar inyecciones
                logEntry[field] = String(req.body[field]).slice(0, 1000); // Limitar longitud
            }
        });

        // Validar que haya al menos un campo obligatorio
        if (!logEntry.level || !logEntry.message) {
            return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes' });
        }

        // Validar nivel de log
        const validLevels = ['info', 'warn', 'error', 'debug'];
        if (!validLevels.includes(logEntry.level)) {
            logEntry.level = 'info'; // Default a info si es inválido
        }

        // Agregar información adicional del request (sanitizada)
        logEntry.ip = req.ip;
        logEntry.userAgent = (req.get('User-Agent') || '').slice(0, 500);
        logEntry.serverTimestamp = new Date().toISOString();

        // Guardar el log sanitizado
        const result = saveThemeLog(logEntry);

        if (result) {
            return res.status(201).json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: 'Error al guardar log' });
        }
    } catch (error) {
        logger.error('Error saving theme log', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Get theme logs with filtering
router.get('/theme', async (req, res) => {
    try {
        // Extract query parameters
        const { level, page, limit, startDate, endDate } = req.query;

        // Parse limit to number if it exists
        const limitNum = limit ? parseInt(limit) : undefined;

        // Get logs with filters
        const logs = getThemeLogs({
            level,
            page,
            limit: limitNum,
            startDate,
            endDate
        });

        res.json(logs);
    } catch (error) {
        logger.error('Error retrieving theme logs', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;