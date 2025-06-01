#!/usr/bin/env node
/**
 * Synchronize version between package.json and version.txt
 * Usage: node scripts/sync-version.js [new-version]
 */

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');
const versionPath = path.join(__dirname, '..', 'version.txt');

function syncVersions(newVersion = null) {
    try {
        // Read current package.json
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        if (newVersion) {
            // Update both files with new version
            packageContent.version = newVersion;
            fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2) + '\n');
            fs.writeFileSync(versionPath, newVersion + '\n');
            console.log(`✅ Updated version to ${newVersion} in both package.json and version.txt`);
        } else {
            // Sync version.txt with package.json
            const currentVersion = packageContent.version;
            fs.writeFileSync(versionPath, currentVersion + '\n');
            console.log(`✅ Synced version.txt with package.json version: ${currentVersion}`);
        }

        // Verify both files have same version
        const versionFileContent = fs.readFileSync(versionPath, 'utf8').trim();
        const packageVersion = packageContent.version;

        if (versionFileContent === packageVersion) {
            console.log(`🎯 Verification successful: ${packageVersion}`);
        } else {
            console.error(`❌ Version mismatch! package.json: ${packageVersion}, version.txt: ${versionFileContent}`);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error syncing versions:', error.message);
        process.exit(1);
    }
}

// Get new version from command line arguments
const newVersion = process.argv[2];
syncVersions(newVersion);