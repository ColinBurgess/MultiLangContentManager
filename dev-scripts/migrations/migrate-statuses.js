/**
 * Script independiente para migrar los estados de contenidos.
 * 
 * Este script actualiza todos los documentos en la colección 'contents',
 * estableciendo los campos 'statusEs' y 'statusEn' según el valor
 * de los campos 'publishedEs' y 'publishedEn'.
 * 
 * Para ejecutar: node Colin/MultiLangContentManager/migrate-statuses.js
 */

const mongoose = require('mongoose');

// URL de conexión a MongoDB (ajusta según tu configuración)
const MONGO_URI = 'mongodb://localhost:27017/multilang';

// Posibles nombres de colección a probar
const COLLECTION_NAMES = ['contents', 'content', 'Contents', 'Content'];

// Función principal
async function migrateStatuses() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Obtener lista de colecciones en la base de datos
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:');
        collections.forEach(collection => {
            console.log(` - ${collection.name}`);
        });
        
        if (collections.length === 0) {
            console.log('No collections found in database. Are you connected to the right database?');
            return;
        }
        
        // Intentar cada posible nombre de colección
        let contents = [];
        let usedCollectionName = '';
        
        for (const collectionName of COLLECTION_NAMES) {
            try {
                console.log(`Trying collection name: ${collectionName}`);
                
                // Crear un modelo dinámico para esta colección
                const schema = new mongoose.Schema({
                    publishedEs: Boolean,
                    publishedEn: Boolean,
                    statusEs: String,
                    statusEn: String
                }, { collection: collectionName, strict: false });
                
                const ContentModel = mongoose.model(`${collectionName}Model`, schema);
                
                // Intentar obtener documentos de esta colección
                const docs = await ContentModel.find({});
                console.log(`Found ${docs.length} documents in '${collectionName}' collection`);
                
                if (docs.length > 0) {
                    contents = docs;
                    usedCollectionName = collectionName;
                    break;
                }
            } catch (err) {
                console.log(`Error with collection '${collectionName}': ${err.message}`);
            }
        }
        
        if (contents.length === 0) {
            console.log('No content documents found in any expected collection.');
            console.log('Tip: Check if your database is populated and contains the correct collection names.');
            return;
        }
        
        console.log(`Using collection '${usedCollectionName}' with ${contents.length} documents`);
        
        // Verificar la estructura de un documento para diagnóstico
        if (contents.length > 0) {
            console.log('Sample document structure:');
            console.log(JSON.stringify(contents[0].toObject(), null, 2));
        }

        // Contador para seguimiento
        let updated = 0;

        // Actualizar cada contenido
        for (const content of contents) {
            // Verificar si el contenido tiene los campos necesarios
            if (content.publishedEs === undefined || content.publishedEn === undefined) {
                console.log(`Document ${content._id} missing required fields`);
                continue;
            }

            // Determinar statusEs basado en publishedEs
            if (content.publishedEs === true) {
                content.statusEs = 'published';
            } else {
                content.statusEs = 'pending';
            }

            // Determinar statusEn basado en publishedEn
            if (content.publishedEn === true) {
                content.statusEn = 'published';
            } else {
                content.statusEn = 'pending';
            }

            // Guardar el contenido actualizado
            await content.save();
            updated++;

            // Mostrar progreso cada 10 elementos
            if (updated % 10 === 0) {
                console.log(`Migrated ${updated}/${contents.length} contents`);
            }
        }

        console.log(`Migration completed. ${updated}/${contents.length} documents updated.`);
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        // Cerrar conexión
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
    }
}

// Ejecutar la migración
migrateStatuses().catch(console.error); 