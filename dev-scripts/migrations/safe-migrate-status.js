/**
 * Script seguro para migrar estados de contenido con backup y capacidad de rollback
 * 
 * Este script realiza los siguientes pasos:
 * 1. Crear una copia de seguridad de la colección 'contents'
 * 2. Migrar los estados basados en publishedEs/En a statusEs/En
 * 3. Permitir revertir los cambios si es necesario
 * 
 * Para ejecutar:
 * - Migración: node Colin/MultiLangContentManager/safe-migrate-status.js migrate
 * - Rollback: node Colin/MultiLangContentManager/safe-migrate-status.js rollback
 * - Verificar: node Colin/MultiLangContentManager/safe-migrate-status.js verify
 */

const mongoose = require('mongoose');

// URL de conexión a MongoDB (ajusta según tu configuración)
const MONGO_URI = 'mongodb://localhost:27017/video-content-organizer';
const BACKUP_COLLECTION = 'contents_backup_' + new Date().toISOString().replace(/[:.]/g, '_');

// Función principal
async function main() {
  try {
    // Analizar el comando
    const command = process.argv[2] || 'verify';
    
    if (!['migrate', 'rollback', 'verify'].includes(command)) {
      console.log('Comando no válido. Uso: node safe-migrate-status.js [migrate|rollback|verify]');
      process.exit(1);
    }
    
    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');
    
    // Ejecutar el comando especificado
    if (command === 'migrate') {
      await createBackup();
      await migrateStatus();
    } else if (command === 'rollback') {
      await rollbackMigration();
    } else if (command === 'verify') {
      await verifyDatabase();
    }
    
    console.log('\nOperación completada con éxito');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
  }
}

// Crear una copia de seguridad de la colección
async function createBackup() {
  console.log('\n=== CREANDO COPIA DE SEGURIDAD ===');
  
  // Verificar si ya existe una copia de seguridad
  const backupCollections = await mongoose.connection.db.listCollections({
    name: { $regex: /^contents_backup_/ }
  }).toArray();
  
  if (backupCollections.length > 0) {
    console.log('Ya existe una copia de seguridad:');
    backupCollections.forEach(coll => console.log(` - ${coll.name}`));
    
    const proceed = await confirmAction('¿Deseas continuar y crear otra copia de seguridad?');
    if (!proceed) {
      console.log('Operación cancelada por el usuario');
      process.exit(0);
    }
  }
  
  // Obtener documentos de la colección original
  const contents = await mongoose.connection.db.collection('contents').find({}).toArray();
  console.log(`Encontrados ${contents.length} documentos para respaldo`);
  
  if (contents.length === 0) {
    console.log('No hay documentos para respaldar. La colección está vacía.');
    return;
  }
  
  // Crear la colección de respaldo
  await mongoose.connection.db.createCollection(BACKUP_COLLECTION);
  
  // Copiar los documentos
  await mongoose.connection.db.collection(BACKUP_COLLECTION).insertMany(contents);
  console.log(`Copia de seguridad creada: ${BACKUP_COLLECTION}`);
  console.log(`Se respaldaron ${contents.length} documentos`);
}

// Migrar los estados de publishedEs/En a statusEs/En
async function migrateStatus() {
  console.log('\n=== MIGRANDO ESTADOS ===');
  
  // Obtener contenidos
  const contents = await mongoose.connection.db.collection('contents').find({}).toArray();
  console.log(`Encontrados ${contents.length} documentos para migrar`);
  
  if (contents.length === 0) {
    console.log('No hay documentos para migrar. La colección está vacía.');
    return;
  }
  
  // Contadores para seguimiento
  let updated = 0;
  let unchanged = 0;
  let withStatusAlready = 0;
  
  // Recorrer cada documento
  for (const content of contents) {
    let modified = false;
    
    // Verificar si el documento ya tiene los campos de estado
    if (content.statusEs !== undefined && content.statusEn !== undefined) {
      withStatusAlready++;
      continue;
    }
    
    // Actualizar statusEs basado en publishedEs
    if (content.publishedEs === true) {
      if (content.statusEs !== 'published') {
        content.statusEs = 'published';
        modified = true;
      }
    } else if (content.publishedEs === false) {
      if (!content.statusEs) {
        content.statusEs = 'pending';
        modified = true;
      }
    }
    
    // Actualizar statusEn basado en publishedEn
    if (content.publishedEn === true) {
      if (content.statusEn !== 'published') {
        content.statusEn = 'published';
        modified = true;
      }
    } else if (content.publishedEn === false) {
      if (!content.statusEn) {
        content.statusEn = 'pending';
        modified = true;
      }
    }
    
    // Si se modificó el documento, actualizarlo en la base de datos
    if (modified) {
      await mongoose.connection.db.collection('contents').updateOne(
        { _id: content._id },
        { $set: { 
          statusEs: content.statusEs, 
          statusEn: content.statusEn 
        }}
      );
      updated++;
    } else {
      unchanged++;
    }
  }
  
  console.log(`Resumen de migración:`);
  console.log(` - Documentos actualizados: ${updated}`);
  console.log(` - Documentos sin cambios: ${unchanged}`);
  console.log(` - Documentos que ya tenían estado: ${withStatusAlready}`);
}

// Revertir la migración usando la copia de seguridad
async function rollbackMigration() {
  console.log('\n=== REVIRTIENDO MIGRACIÓN ===');
  
  // Encontrar la última copia de seguridad
  const backupCollections = await mongoose.connection.db.listCollections({
    name: { $regex: /^contents_backup_/ }
  }).toArray();
  
  if (backupCollections.length === 0) {
    console.log('No se encontró ninguna copia de seguridad para restaurar');
    return;
  }
  
  // Ordenar por nombre (que incluye la fecha)
  backupCollections.sort((a, b) => b.name.localeCompare(a.name));
  const latestBackup = backupCollections[0].name;
  
  console.log(`Usando la copia de seguridad más reciente: ${latestBackup}`);
  
  // Solicitar confirmación
  const proceed = await confirmAction('¿Estás seguro de querer restaurar esta copia? Esta acción reemplazará TODOS los datos actuales.');
  if (!proceed) {
    console.log('Operación de restauración cancelada');
    return;
  }
  
  // Obtener los datos de la copia de seguridad
  const backupData = await mongoose.connection.db.collection(latestBackup).find({}).toArray();
  console.log(`La copia de seguridad contiene ${backupData.length} documentos`);
  
  // Crear una copia de los datos actuales antes de restaurar
  const currentData = await mongoose.connection.db.collection('contents').find({}).toArray();
  const preRestoreBackup = 'contents_prerestore_' + new Date().toISOString().replace(/[:.]/g, '_');
  
  if (currentData.length > 0) {
    await mongoose.connection.db.createCollection(preRestoreBackup);
    await mongoose.connection.db.collection(preRestoreBackup).insertMany(currentData);
    console.log(`Se creó copia de seguridad de datos actuales: ${preRestoreBackup}`);
  }
  
  // Eliminar todos los documentos de la colección actual
  await mongoose.connection.db.collection('contents').deleteMany({});
  
  // Insertar los documentos de la copia de seguridad
  if (backupData.length > 0) {
    await mongoose.connection.db.collection('contents').insertMany(backupData);
  }
  
  console.log(`Restauración completada. Se restauraron ${backupData.length} documentos`);
}

// Verificar el estado de la base de datos
async function verifyDatabase() {
  console.log('\n=== VERIFICACIÓN DE BASE DE DATOS ===');
  
  // Lista de bases de datos
  const adminDb = mongoose.connection.db.admin();
  const dbInfo = await adminDb.listDatabases();
  console.log('\n=== BASES DE DATOS DISPONIBLES ===');
  dbInfo.databases.forEach(db => {
    console.log(` - ${db.name}`);
  });
  
  // Listar colecciones
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n=== COLECCIONES EN BASE DE DATOS ACTUAL ===');
  collections.forEach(collection => {
    console.log(` - ${collection.name}`);
  });
  
  // Verificar la colección 'contents'
  if (collections.some(c => c.name === 'contents')) {
    const contentsCount = await mongoose.connection.db.collection('contents').countDocuments();
    console.log(`\nLa colección 'contents' tiene ${contentsCount} documentos`);
    
    if (contentsCount > 0) {
      // Mostrar un documento de ejemplo
      const sampleDoc = await mongoose.connection.db.collection('contents').findOne({});
      console.log('\nEstructura de documento de ejemplo:');
      
      // Mostrar los campos y tipos
      Object.keys(sampleDoc).forEach(field => {
        const value = sampleDoc[field];
        const type = typeof value;
        console.log(` - ${field}: ${type}`);
      });
      
      // Mostrar distribución de estados
      console.log('\nDistribución de estados:');
      
      // Verificar publishedEs/En
      const publishedEsCount = await mongoose.connection.db.collection('contents')
        .countDocuments({ publishedEs: true });
      const publishedEnCount = await mongoose.connection.db.collection('contents')
        .countDocuments({ publishedEn: true });
      
      console.log(` - publishedEs=true: ${publishedEsCount}/${contentsCount}`);
      console.log(` - publishedEn=true: ${publishedEnCount}/${contentsCount}`);
      
      // Verificar statusEs/En si existen
      if ('statusEs' in sampleDoc) {
        const statusEsDist = await mongoose.connection.db.collection('contents').aggregate([
          { $group: { _id: "$statusEs", count: { $sum: 1 } } }
        ]).toArray();
        
        console.log(' - Distribución de statusEs:');
        statusEsDist.forEach(item => {
          console.log(`   · ${item._id || 'null'}: ${item.count}`);
        });
      } else {
        console.log(' - El campo statusEs no existe en los documentos');
      }
      
      if ('statusEn' in sampleDoc) {
        const statusEnDist = await mongoose.connection.db.collection('contents').aggregate([
          { $group: { _id: "$statusEn", count: { $sum: 1 } } }
        ]).toArray();
        
        console.log(' - Distribución de statusEn:');
        statusEnDist.forEach(item => {
          console.log(`   · ${item._id || 'null'}: ${item.count}`);
        });
      } else {
        console.log(' - El campo statusEn no existe en los documentos');
      }
    }
  }
  
  // Listar copias de seguridad
  const backupCollections = collections.filter(c => c.name.startsWith('contents_backup_'));
  
  if (backupCollections.length > 0) {
    console.log('\n=== COPIAS DE SEGURIDAD DISPONIBLES ===');
    backupCollections.forEach(coll => {
      console.log(` - ${coll.name}`);
    });
  } else {
    console.log('\nNo hay copias de seguridad disponibles');
  }
}

// Función para solicitar confirmación del usuario
async function confirmAction(question) {
  const readline = require('readline');
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

// Ejecutar el script
main().catch(console.error); 