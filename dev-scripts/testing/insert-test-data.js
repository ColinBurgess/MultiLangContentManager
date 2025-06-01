/**
 * Script para insertar datos de prueba en la base de datos.
 * 
 * Este script inserta documentos de prueba en la colección 'contents'
 * para permitir probar la migración de estados.
 * 
 * Para ejecutar: node Colin/MultiLangContentManager/insert-test-data.js
 */

const mongoose = require('mongoose');

// URL de conexión a MongoDB (ajusta según tu configuración)
const MONGO_URI = 'mongodb://localhost:27017/multilang';

// Esquema simplificado
const contentSchema = new mongoose.Schema({
  title: String,
  content: String,
  publishedEs: Boolean,
  publishedEn: Boolean
}, { collection: 'contents' });

const Content = mongoose.model('Content', contentSchema);

// Datos de ejemplo
const testData = [
  {
    title: 'Ejemplo 1',
    content: 'Contenido de ejemplo 1',
    publishedEs: true,
    publishedEn: false
  },
  {
    title: 'Ejemplo 2',
    content: 'Contenido de ejemplo 2',
    publishedEs: false,
    publishedEn: true
  },
  {
    title: 'Ejemplo 3',
    content: 'Contenido de ejemplo 3',
    publishedEs: true,
    publishedEn: true
  },
  {
    title: 'Ejemplo 4',
    content: 'Contenido de ejemplo 4',
    publishedEs: false,
    publishedEn: false
  }
];

async function insertTestData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Verificar si ya hay datos
    const existingCount = await Content.countDocuments();
    console.log(`Found ${existingCount} existing documents in 'contents' collection`);
    
    if (existingCount > 0) {
      console.log('Database already contains data. Dropping collection first...');
      await mongoose.connection.db.dropCollection('contents');
      console.log('Collection dropped successfully.');
    }
    
    // Insertar datos de prueba
    const result = await Content.insertMany(testData);
    console.log(`Inserted ${result.length} test documents.`);
    
    // Mostrar los documentos insertados
    const insertedDocs = await Content.find();
    console.log('Inserted documents:');
    console.log(JSON.stringify(insertedDocs, null, 2));
    
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

// Ejecutar la inserción
insertTestData().catch(console.error); 