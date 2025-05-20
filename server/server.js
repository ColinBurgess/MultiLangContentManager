require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { getMongoDBUri } = require('../utils/credentials');
const contentRoutes = require('./routes/content');
const taskRoutes = require('./routes/task');
const logRoutes = require('./routes/logs');
const promptRoutes = require('./routes/prompt');
const logger = require('../utils/logger');

const app = express();

// Configuración de CORS segura pero flexible para desarrollo
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000')
        : '*', // En desarrollo, permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 horas en segundos
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // Limitar tamaño del payload
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Headers de seguridad
app.use((req, res, next) => {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Proteger contra XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Evitar MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
        // Política de seguridad de contenido compatible con CDNs y recursos externos
    if (process.env.NODE_ENV === 'production') {
        // CSP más restrictiva para producción
        const cspValue = "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; " +
            "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; " +
            "img-src 'self' data:; " +
            "connect-src 'self'";
        res.setHeader('Content-Security-Policy', cspValue);
    }
    // En desarrollo, no aplicamos restricciones CSP
    // No cachetear datos sensibles
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.use(express.static(path.join(__dirname, '../client/public')));

// MongoDB Connection
async function connectToMongoDB() {
    try {
        const uri = getMongoDBUri();

        // Opciones seguras para la conexión MongoDB
        const mongooseOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
            socketTimeoutMS: 45000, // Se cierra el socket si está inactivo por 45 segundos
            family: 4 // Usar IPv4, skip IPv6
        };

        // Configuración global de mongoose para evitar inyecciones
        mongoose.set('strictQuery', true); // Solo permite campos definidos en el esquema

        await mongoose.connect(uri, mongooseOptions);
        logger.success('✅ Successfully connected to MongoDB');
    } catch (error) {
        logger.error('❌ Error connecting to MongoDB', error);
        process.exit(1);
    }
}

connectToMongoDB();

// Routes - Fixing route registration by removing trailing slashes
app.use('/api/contents', contentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/prompts', promptRoutes);

// Add diagnostics endpoint to check routes
app.get('/api/system/routes', (req, res) => {
    const routes = [];

    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes directly on the app
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods),
                layer: 'app'
            });
        } else if (middleware.name === 'router') {
            // Router middleware
            middleware.handle.stack.forEach((handler) => {
                const baseRoute = middleware.regexp.toString()
                    .replace('\\/?(?=\\/|$)', '')
                    .replace('^\\', '')
                    .replace('\\/?$', '')
                    .replace(/\\\//g, '/');

                if (handler.route) {
                    const route = handler.route.path === '/'
                        ? baseRoute
                        : baseRoute + handler.route.path;

                    routes.push({
                        path: route,
                        methods: Object.keys(handler.route.methods),
                        layer: 'router'
                    });
                }
            });
        }
    });

    res.json(routes);
});

// Direct route handler for /api/tasks as fallback
app.get('/api/tasks', async (req, res, next) => {
    // Check if request has already been handled
    if (res.headersSent) {
        return next();
    }

    try {
        // Try to get tasks directly using the mongoose model
        const Task = mongoose.model('Task');
        const tasks = await Task.find().sort({ createdAt: -1 });
        logger.success(`Found ${tasks.length} tasks via direct route`);
        res.json(tasks);
    } catch (error) {
        logger.error('Error in fallback task route', error);
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Log completo del error para diagnóstico interno
    logger.error('Unhandled error', err);

    // Determinar código de estado HTTP apropiado
    let statusCode = 500;
    if (err.name === 'ValidationError') {
        statusCode = 400;
    } else if (err.name === 'CastError') {
        statusCode = 400;
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409; // Conflicto - clave duplicada
    }

    // Respuesta genérica para el cliente sin detalles específicos del error
    const errorResponse = {
        message: 'Internal server error',
        errorId: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    };

    // En desarrollo podemos incluir más detalles
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = err.message;
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.success(`🚀 Server running on port ${PORT}`);
});