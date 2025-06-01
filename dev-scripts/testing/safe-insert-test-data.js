/**
 * Script seguro para insertar datos de prueba
 * 
 * Este script inserta documentos de prueba en la colección 'contents'
 * con verificaciones de seguridad para evitar pérdida de datos.
 * 
 * Para ejecutar: node Colin/MultiLangContentManager/safe-insert-test-data.js
 */

const mongoose = require('mongoose');
const readline = require('readline');

// URL de conexión a MongoDB (ajusta según tu configuración)
const MONGO_URI = 'mongodb://localhost:27017/video-content-organizer';

// Esquema simplificado para el modelo Content
const contentSchema = new mongoose.Schema({
  title: String,
  content: String,
  publishedEs: Boolean,
  publishedEn: Boolean,
  statusEs: {
    type: String,
    enum: ['pending', 'in-progress', 'published'],
    default: 'pending'
  },
  statusEn: {
    type: String,
    enum: ['pending', 'in-progress', 'published'],
    default: 'pending'
  }
}, { collection: 'contents' });

// Crear el modelo
const Content = mongoose.model('Content', contentSchema);

// Datos de ejemplo
const testData = [
  {
    title: 'Ejemplo 1',
    content: 'Contenido de ejemplo 1',
    publishedEs: true,
    publishedEn: false,
    statusEs: 'published',
    statusEn: 'pending'
  },
  {
    title: 'Ejemplo 2',
    content: 'Contenido de ejemplo 2',
    publishedEs: false,
    publishedEn: true,
    statusEs: 'pending',
    statusEn: 'published'
  },
  {
    title: 'Ejemplo 3',
    content: 'Contenido de ejemplo 3',
    publishedEs: true,
    publishedEn: true,
    statusEs: 'published',
    statusEn: 'published'
  },
  {
    title: 'Ejemplo 4',
    content: 'Contenido de ejemplo 4',
    publishedEs: false,
    publishedEn: false,
    statusEs: 'in-progress',
    statusEn: 'in-progress'
  }
];

// Función para solicitar confirmación del usuario
async function confirmAction(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(`${question} (s/n): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sí' || answer.toLowerCase() === 'si');
    });
  });
}

// Función principal
async function insertTestData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');
    
    // Crear una copia de seguridad antes de hacer cambios
    console.log('\n=== VERIFICANDO BASE DE DATOS ===');
    
    // Verificar si la colección existe y tiene datos
    const collections = await mongoose.connection.db.listCollections({ name: 'contents' }).toArray();
    const collectionExists = collections.length > 0;
    
    if (collectionExists) {
      const existingCount = await Content.countDocuments();
      console.log(`La colección 'contents' existe y tiene ${existingCount} documentos`);
      
      if (existingCount > 0) {
        // Mostrar advertencia y solicitar confirmación
        console.log('\n¡ADVERTENCIA! La colección ya contiene datos.');
        console.log('Insertar nuevos datos podría causar problemas si los datos existentes son importantes.');
        
        const backupCollectionName = `contents_backup_${new Date().toISOString().replace(/[:.]/g, '_')}`;
        console.log(`\nSe creará una copia de seguridad llamada '${backupCollectionName}' antes de proceder.`);
        
        const proceed = await confirmAction('¿Deseas continuar con la inserción de datos de prueba?');
        
        if (!proceed) {
          console.log('Operación cancelada por el usuario');
          return;
        }
        
        // Crear copia de seguridad
        console.log('\n=== CREANDO COPIA DE SEGURIDAD ===');
        const existingData = await Content.find().lean();
        
        await mongoose.connection.db.createCollection(backupCollectionName);
        await mongoose.connection.db.collection(backupCollectionName).insertMany(existingData);
        console.log(`Copia de seguridad creada con éxito (${existingData.length} documentos)`);
        
        // Preguntar si desea eliminar los datos existentes
        const dropExisting = await confirmAction('¿Deseas eliminar los datos existentes antes de insertar los nuevos?');
        
        if (dropExisting) {
          await mongoose.connection.db.collection('contents').deleteMany({});
          console.log('Datos existentes eliminados');
        } else {
          console.log('Los nuevos datos se añadirán a los existentes');
        }
      }
    } else {
      console.log('La colección contents no existe. Se creará automáticamente.');
    }
    
    // Insertar datos de prueba
    console.log('\n=== INSERTANDO DATOS DE PRUEBA ===');
    const result = await Content.insertMany(testData);
    console.log(`Insertados ${result.length} documentos de prueba`);
    
    // Mostrar los documentos insertados
    console.log('\nDocumentos insertados:');
    for (let i = 0; i < result.length; i++) {
      console.log(`\nDocumento #${i+1}:`);
      console.log(` - ID: ${result[i]._id}`);
      console.log(` - Título: ${result[i].title}`);
      console.log(` - publishedEs: ${result[i].publishedEs}`);
      console.log(` - publishedEn: ${result[i].publishedEn}`);
      console.log(` - statusEs: ${result[i].statusEs}`);
      console.log(` - statusEn: ${result[i].statusEn}`);
    }
    
    // Mostrar total de documentos en la colección
    const totalDocs = await Content.countDocuments();
    console.log(`\nTotal de documentos en la colección: ${totalDocs}`);
    
  } catch (error) {
    console.error('Error insertando datos de prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nConexión a MongoDB cerrada');
  }
}

// Ejecutar la función
insertTestData().catch(console.error); 