const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Custom format for logs
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

// Logger for successful operations
const successLogger = winston.createLogger({
    format: customFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'success.log'),
            level: 'info'
        })
    ]
});

// Logger for errors
const errorLogger = winston.createLogger({
    format: customFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        })
    ]
});

// If not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
    successLogger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            customFormat
        )
    }));

    errorLogger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            customFormat
        )
    }));
}

module.exports = {
    success: (message) => successLogger.info(message),
    error: (message, error) => {
        const errorMessage = error ? `${message}: ${error.message}\n${error.stack}` : message;
        errorLogger.error(errorMessage);
    }
};