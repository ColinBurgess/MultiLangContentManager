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
        // Connect to MongoDB without authentication
        const client = await MongoClient.connect('mongodb://localhost:27017/admin');
        const adminDb = client.db('admin');

        // Check if admin user already exists
        const users = await adminDb.command({ usersInfo: 1 });
        if (users.users.length > 0) {
            console.log('⚠️  Admin user already exists in the database.');
            console.log('If you need to reset the user, you must first delete the existing user.');
            await client.close();
            process.exit(0);
        }

        // Request credentials securely
        const username = await new Promise(resolve => {
            rl.question('Enter admin username: ', resolve);
        });

        const password = await new Promise(resolve => {
            rl.question('Enter admin password: ', resolve);
        });

        // Generate random salt
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

        // Create admin user
        await adminDb.command({
            createUser: username,
            pwd: password,
            roles: [
                { role: "userAdminAnyDatabase", db: "admin" },
                { role: "readWriteAnyDatabase", db: "admin" }
            ]
        });

        console.log('✅ Admin user created successfully');
        console.log('\nTo update your .env file, use this connection URI:');
        console.log(`MONGODB_URI=mongodb://${username}:${password}@localhost:27017/video-content-organizer?authSource=admin`);

        // Create database and collection for the application
        const appDb = client.db('video-content-organizer');
        await appDb.createCollection('contents');
        console.log('\n✅ Database and collection created successfully');

        // Create search indexes
        await appDb.collection('contents').createIndex({ title: 'text', tags: 'text', descriptionEs: 'text', descriptionEn: 'text' });
        console.log('✅ Indexes created successfully');

        await client.close();
        console.log('\n🎉 Initialization completed!');

        // Save salt in a secure file
        const fs = require('fs');
        const configDir = './config';
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }
        fs.writeFileSync('./config/auth.json', JSON.stringify({ salt }, null, 2));

    } catch (error) {
        console.error('❌ Error during initialization:', error);
    } finally {
        rl.close();
    }
}

initializeDatabase();