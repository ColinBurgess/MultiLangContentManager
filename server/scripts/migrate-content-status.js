/**
 * Script de migración para actualizar los campos statusEs y statusEn
 * basándose en los valores actuales de publishedEs y publishedEn.
 * 
 * Para ejecutar: node Colin/MultiLangContentManager/server/scripts/migrate-content-status.js
 */

const mongoose = require('mongoose');
const Content = require('../models/Content');

// URL de conexión a MongoDB (asegúrate de que esta URL coincida con la que usa tu aplicación)
const MONGO_URI = 'mongodb://localhost:27017/multilang';

// Conexión a la base de datos
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB. Starting migration...');
        migrateContentStatus();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function migrateContentStatus() {
    try {
        // Obtener todos los contenidos
        const contents = await Content.find({});
        console.log(`Found ${contents.length} contents to migrate`);

        // Contador para el seguimiento
        let updated = 0;

        // Recorrer cada contenido y actualizar sus estados
        for (const content of contents) {
            // Determinar statusEs basado en publishedEs
            if (content.publishedEs === true) {
                content.statusEs = 'published';
            } else {
                // Si no está establecido, usar 'pending'
                content.statusEs = content.statusEs || 'pending';
            }

            // Determinar statusEn basado en publishedEn
            if (content.publishedEn === true) {
                content.statusEn = 'published';
            } else {
                // Si no está establecido, usar 'pending'
                content.statusEn = content.statusEn || 'pending';
            }

            // Guardar el contenido actualizado
            await content.save();
            updated++;

            // Mostrar progreso cada 10 elementos
            if (updated % 10 === 0) {
                console.log(`Migrated ${updated}/${contents.length} contents`);
            }
        }

        console.log(`Migration completed. ${updated} contents updated.`);
        mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        mongoose.disconnect();
        process.exit(1);
    }
} 