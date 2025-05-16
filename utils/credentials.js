const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateKey(masterPassword, salt) {
    return crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha512');
}

function decrypt(encryptedData, key, iv, authTag) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function getMongoDBUri() {
    try {
        // Verify that master password exists
        const masterPassword = process.env.MASTER_PASSWORD;
        if (!masterPassword) {
            throw new Error('MASTER_PASSWORD is not defined in environment variables');
        }

        // Read configuration file
        const configPath = path.join(__dirname, '..', 'config', 'encrypted-credentials.json');
        if (!fs.existsSync(configPath)) {
            throw new Error('Encrypted credentials file not found');
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Generate decryption key
        const key = generateKey(masterPassword, Buffer.from(config.salt, 'hex'));

        // Decrypt credentials
        const credentials = decrypt(
            config.encryptedData,
            key,
            Buffer.from(config.iv, 'hex'),
            Buffer.from(config.authTag, 'hex')
        );

        // Build MongoDB URI
        const [username, password] = credentials.split(':');
        return `mongodb://${username}:${password}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=${process.env.MONGODB_AUTH_SOURCE}`;

    } catch (error) {
        console.error('Error getting MongoDB credentials:', error.message);
        throw error;
    }
}

module.exports = {
    getMongoDBUri
};