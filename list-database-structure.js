/**
 * Script para listar la estructura de la base de datos
 * 
 * Este script examina todas las colecciones en la base de datos
 * y muestra información sobre sus documentos para entender
 * cómo está organizada la base de datos.
 * 
 * Para ejecutar: node Colin/MultiLangContentManager/list-database-structure.js
 */

const mongoose = require('mongoose');

// URL de conexión a MongoDB (ajusta según tu configuración)
const MONGO_URI = 'mongodb://localhost:27017/video-content-organizer';

async function exploreDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');
    
    // Obtener lista de todas las bases de datos
    const adminDb = mongoose.connection.db.admin();
    const dbInfo = await adminDb.listDatabases();
    console.log('\n=== BASES DE DATOS DISPONIBLES ===');
    dbInfo.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
    // Obtener lista de colecciones en la base de datos actual
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== COLECCIONES EN BASE DE DATOS ACTUAL ===');
    if (collections.length === 0) {
      console.log('No se encontraron colecciones en esta base de datos.');
    } else {
      for (const collection of collections) {
        console.log(`\nColección: ${collection.name}`);
        
        // Obtener un documento de muestra
        const docs = await mongoose.connection.db.collection(collection.name).find().limit(1).toArray();
        
        if (docs.length > 0) {
          // Contar documentos totales
          const count = await mongoose.connection.db.collection(collection.name).countDocuments();
          console.log(`Total de documentos: ${count}`);
          
          // Mostrar estructura del documento de muestra
          console.log('Estructura de documento de muestra:');
          const sampleDoc = docs[0];
          const fields = Object.keys(sampleDoc);
          
          // Mostrar campos y sus tipos
          fields.forEach(field => {
            const value = sampleDoc[field];
            const type = typeof value;
            console.log(` - ${field}: ${type} ${type === 'object' && value !== null ? '(' + (Array.isArray(value) ? 'array' : 'object') + ')' : ''}`);
          });
          
          // Buscar documentos específicamente relacionados con contenido multilingüe
          if (fields.includes('publishedEs') || fields.includes('publishedEn') || 
              fields.includes('statusEs') || fields.includes('statusEn')) {
            console.log('\nEsta colección parece contener documentos de contenido multilingüe.');
            
            // Mostrar distribución de estados de publicación
            if (fields.includes('publishedEs')) {
              const publishedEsCount = await mongoose.connection.db.collection(collection.name)
                .countDocuments({ publishedEs: true });
              console.log(`Documentos con publishedEs=true: ${publishedEsCount}`);
            }
            
            if (fields.includes('publishedEn')) {
              const publishedEnCount = await mongoose.connection.db.collection(collection.name)
                .countDocuments({ publishedEn: true });
              console.log(`Documentos con publishedEn=true: ${publishedEnCount}`);
            }
            
            if (fields.includes('statusEs')) {
              const statusEsDistribution = await mongoose.connection.db.collection(collection.name).aggregate([
                { $group: { _id: "$statusEs", count: { $sum: 1 } } }
              ]).toArray();
              console.log('Distribución de statusEs:', statusEsDistribution.map(item => `${item._id || 'null'}: ${item.count}`).join(', '));
            }
            
            if (fields.includes('statusEn')) {
              const statusEnDistribution = await mongoose.connection.db.collection(collection.name).aggregate([
                { $group: { _id: "$statusEn", count: { $sum: 1 } } }
              ]).toArray();
              console.log('Distribución de statusEn:', statusEnDistribution.map(item => `${item._id || 'null'}: ${item.count}`).join(', '));
            }
            
            // Mostrar 5 documentos de ejemplo para esta colección
            console.log('\nMostrando hasta 5 documentos de ejemplo:');
            const sampleDocs = await mongoose.connection.db.collection(collection.name).find().limit(5).toArray();
            sampleDocs.forEach((doc, i) => {
              console.log(`\nDocumento #${i+1}:`);
              console.log(JSON.stringify(doc, null, 2));
            });
          }
        } else {
          console.log('Colección vacía, no hay documentos para mostrar.');
        }
      }
    }
    
  } catch (error) {
    console.error('Error explorando la base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nConexión a MongoDB cerrada');
  }
}

// Ejecutar la exploración
exploreDatabase().catch(console.error); 