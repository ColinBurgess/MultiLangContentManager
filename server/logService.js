/**
 * Log Service
 * Servicio para guardar logs en archivos para análisis posterior
 */

const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Configuración
const LOG_DIR = path.join(__dirname, '../logs');
const THEME_LOGS_FILE = 'theme-logs.jsonl';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const THEME_LOGS_ENABLED = false; // Desactivar el almacenamiento de logs

// Asegurar que el directorio de logs existe
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`Directorio de logs creado: ${LOG_DIR}`);
}

/**
 * Guarda un log de tema en el archivo
 * @param {Object} logEntry - Entrada de log a guardar
 */
function saveThemeLog(logEntry) {
    // Si el logging está desactivado, no hacer nada
    if (!THEME_LOGS_ENABLED) return true;

    try {
        // Validar entrada
        if (!logEntry || typeof logEntry !== 'object') {
            console.error('Entrada de log inválida:', logEntry);
            return false;
        }

        // Añadir timestamp del servidor si no existe
        if (!logEntry.serverTimestamp) {
            logEntry.serverTimestamp = new Date().toISOString();
        }

        // Ruta completa al archivo de logs
        const logFilePath = path.join(LOG_DIR, THEME_LOGS_FILE);

        // Verificar tamaño del archivo y rotarlo si es necesario
        checkAndRotateLogFile(logFilePath);

        // Convertir a formato JSONL (cada línea es un objeto JSON válido)
        const logLine = JSON.stringify(logEntry) + '\n';

        // Append al archivo
        fs.appendFileSync(logFilePath, logLine);

        return true;
    } catch (error) {
        console.error('Error al guardar log de tema:', error);
        return false;
    }
}

/**
 * Comprueba el tamaño del archivo de logs y lo rota si es necesario
 * @param {string} filePath - Ruta al archivo de logs
 */
function checkAndRotateLogFile(filePath) {
    try {
        // Si el archivo no existe, no hay nada que rotar
        if (!fs.existsSync(filePath)) {
            return;
        }

        // Obtener estadísticas del archivo
        const stats = fs.statSync(filePath);

        // Si el archivo es demasiado grande, rotarlo
        if (stats.size > MAX_FILE_SIZE) {
            // Formato de fecha para el archivo rotado
            const timestamp = moment().format('YYYY-MM-DD-HHmmss');
            const rotatedFilePath = `${filePath}.${timestamp}`;

            // Renombrar archivo actual
            fs.renameSync(filePath, rotatedFilePath);
            console.log(`Log rotado: ${rotatedFilePath}`);
        }
    } catch (error) {
        console.error('Error al rotar archivo de log:', error);
    }
}

/**
 * Obtiene los logs de tema del archivo
 * @param {Object} options - Opciones de filtrado
 * @param {number} options.limit - Número máximo de entradas a devolver
 * @param {string} options.level - Nivel de log a filtrar (info, error, etc.)
 * @param {string} options.page - Página a filtrar
 * @param {string} options.startDate - Fecha de inicio para filtrar (ISO string)
 * @param {string} options.endDate - Fecha de fin para filtrar (ISO string)
 * @returns {Array} - Array de entradas de log
 */
function getThemeLogs(options = {}) {
    try {
        const logFilePath = path.join(LOG_DIR, THEME_LOGS_FILE);

        // Si el archivo no existe, devolver array vacío
        if (!fs.existsSync(logFilePath)) {
            return [];
        }

        // Leer archivo
        const content = fs.readFileSync(logFilePath, 'utf8');

        // Convertir de JSONL a array de objetos
        const logs = content
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line));

        // Aplicar filtros si existen
        let filteredLogs = logs;

        if (options.level) {
            filteredLogs = filteredLogs.filter(log => log.level === options.level);
        }

        if (options.page) {
            filteredLogs = filteredLogs.filter(log => log.page && log.page.includes(options.page));
        }

        if (options.startDate) {
            const startTime = new Date(options.startDate).getTime();
            filteredLogs = filteredLogs.filter(log => {
                const logTime = new Date(log.timestamp || log.serverTimestamp).getTime();
                return logTime >= startTime;
            });
        }

        if (options.endDate) {
            const endTime = new Date(options.endDate).getTime();
            filteredLogs = filteredLogs.filter(log => {
                const logTime = new Date(log.timestamp || log.serverTimestamp).getTime();
                return logTime <= endTime;
            });
        }

        // Aplicar límite si existe
        if (options.limit && options.limit > 0) {
            filteredLogs = filteredLogs.slice(-options.limit);
        }

        return filteredLogs;
    } catch (error) {
        console.error('Error al leer logs de tema:', error);
        return [];
    }
}

// Exportar funciones
module.exports = {
    saveThemeLog,
    getThemeLogs
};