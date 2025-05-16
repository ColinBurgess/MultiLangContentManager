const express = require('express');
const router = express.Router();
const { saveThemeLog, getThemeLogs } = require('../logService');
const logger = require('../../utils/logger');

// Save theme log
router.post('/theme', async (req, res) => {
    try {
        const logEntry = req.body;

        // Agregar información adicional del request
        logEntry.ip = req.ip;
        logEntry.userAgent = req.get('User-Agent');

        const result = saveThemeLog(logEntry);

        if (result) {
            return res.status(201).json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: 'Error al guardar log' });
        }
    } catch (error) {
        logger.error('Error saving theme log', error);
        res.status(500).json({ success: false, message: error.message });
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