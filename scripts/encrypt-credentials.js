const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to generate an encryption key based on a master password
function generateKey(masterPassword, salt) {
    return crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha512');
}

// Function to encrypt text
function encrypt(text, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        encrypted,
        authTag: authTag.toString('hex'),
        iv: iv.toString('hex')
    };
}

async function encryptCredentials() {
    try {
        // Request credentials and master password
        const username = await new Promise(resolve => {
            rl.question('Enter MongoDB username: ', resolve);
        });

        const password = await new Promise(resolve => {
            rl.question('Enter MongoDB password: ', resolve);
        });

        const masterPassword = await new Promise(resolve => {
            rl.question('Enter a master password for encryption (store it in a safe place): ', resolve);
        });

        // Generate salt and initialization vector
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(12);

        // Generate encryption key
        const key = generateKey(masterPassword, salt);

        // Encrypt credentials
        const credentials = `${username}:${password}`;
        const encrypted = encrypt(credentials, key, iv);

        // Create configuration object
        const config = {
            salt: salt.toString('hex'),
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            encryptedData: encrypted.encrypted
        };

        // Save to configuration file
        const configDir = path.join(__dirname, '..', 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }

        fs.writeFileSync(
            path.join(configDir, 'encrypted-credentials.json'),
            JSON.stringify(config, null, 2)
        );

        // Create example .env file
        const envExample = `# Database configuration
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=video-content-organizer
MONGODB_AUTH_SOURCE=admin
MASTER_PASSWORD=your_master_password_here

# Server port
PORT=3000
`;

        fs.writeFileSync(
            path.join(__dirname, '..', '.env.example'),
            envExample
        );

        console.log('\n✅ Encrypted credentials saved successfully');
        console.log('📁 Configuration file created: config/encrypted-credentials.json');
        console.log('📝 Example .env file created: .env.example');
        console.log('\n⚠️  IMPORTANT:');
        console.log('1. Store the master password in a safe place');
        console.log('2. Do not share the encrypted-credentials.json file');
        console.log('3. Add the master password to your .env file as MASTER_PASSWORD');

    } catch (error) {
        console.error('❌ Error encrypting credentials:', error);
    } finally {
        rl.close();
    }
}

encryptCredentials();