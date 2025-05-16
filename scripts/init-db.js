require('dotenv').config();
const { MongoClient } = require('mongodb');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function initializeDatabase() {
    try {
        // Conectar a MongoDB sin autenticación
        const client = await MongoClient.connect('mongodb://localhost:27017/admin');
        const adminDb = client.db('admin');

        // Verificar si ya existe un usuario administrador
        const users = await adminDb.command({ usersInfo: 1 });
        if (users.users.length > 0) {
            console.log('⚠️  Ya existe un usuario administrador en la base de datos.');
            console.log('Si necesitas restablecer el usuario, primero debes eliminar el usuario existente.');
            await client.close();
            process.exit(0);
        }

        // Solicitar credenciales de manera segura
        const username = await new Promise(resolve => {
            rl.question('Ingresa el nombre de usuario administrador: ', resolve);
        });

        const password = await new Promise(resolve => {
            rl.question('Ingresa la contraseña del administrador: ', resolve);
        });

        // Generar un salt aleatorio
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

        // Crear usuario administrador
        await adminDb.command({
            createUser: username,
            pwd: password,
            roles: [
                { role: "userAdminAnyDatabase", db: "admin" },
                { role: "readWriteAnyDatabase", db: "admin" }
            ]
        });

        console.log('✅ Usuario administrador creado exitosamente');
        console.log('\nPara actualizar tu archivo .env, usa esta URI de conexión:');
        console.log(`MONGODB_URI=mongodb://${username}:${password}@localhost:27017/video-content-organizer?authSource=admin`);

        // Crear la base de datos y colección para la aplicación
        const appDb = client.db('video-content-organizer');
        await appDb.createCollection('contents');
        console.log('\n✅ Base de datos y colección creadas exitosamente');

        // Crear índices para búsqueda
        await appDb.collection('contents').createIndex({ title: 'text', tags: 'text', descriptionEs: 'text', descriptionEn: 'text' });
        console.log('✅ Índices creados exitosamente');

        await client.close();
        console.log('\n🎉 Inicialización completada!');

        // Guardar el salt en un archivo seguro
        const fs = require('fs');
        const configDir = './config';
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }
        fs.writeFileSync('./config/auth.json', JSON.stringify({ salt }, null, 2));

    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
    } finally {
        rl.close();
    }
}

initializeDatabase();