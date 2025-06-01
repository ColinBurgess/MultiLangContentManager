/**
 * Migration script for platform-specific data
 * This script safely migrates existing content to use platform-specific fields
 * while maintaining backward compatibility
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the updated Content model
const Content = require('./server/models/Content');

async function migratePlatformData() {
    try {
        console.log('🚀 Starting platform data migration...');

        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multilangcontentmanager';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find all content that doesn't have platformStatus yet
        const contentsToMigrate = await Content.find({
            $or: [
                { platformStatus: { $exists: false } },
                { platformStatus: null },
                { 'platformStatus.youtube': { $exists: false } }
            ]
        });

        console.log(`📊 Found ${contentsToMigrate.length} items to migrate`);

        let migratedCount = 0;

        for (const content of contentsToMigrate) {
            const updates = {
                platformStatus: {
                    youtube: {
                        statusEs: content.statusEs || (content.publishedEs ? 'published' : 'pending'),
                        statusEn: content.statusEn || (content.publishedEn ? 'published' : 'pending'),
                        urlEs: content.publishedUrlEs || '',
                        urlEn: content.publishedUrlEn || '',
                        publishedDateEs: content.publishedDateEs || (content.publishedEs ? content.publishedDate || new Date() : null),
                        publishedDateEn: content.publishedDateEn || (content.publishedEn ? content.publishedDate || new Date() : null)
                    },
                    tiktok: {
                        statusEs: 'pending',
                        statusEn: 'pending',
                        urlEs: '',
                        urlEn: '',
                        publishedDateEs: null,
                        publishedDateEn: null
                    },
                    instagram: {
                        statusEs: 'pending',
                        statusEn: 'pending',
                        urlEs: '',
                        urlEn: '',
                        publishedDateEs: null,
                        publishedDateEn: null
                    },
                    twitter: {
                        statusEs: 'pending',
                        statusEn: 'pending',
                        urlEs: '',
                        urlEn: '',
                        publishedDateEs: null,
                        publishedDateEn: null
                    },
                    facebook: {
                        statusEs: 'pending',
                        statusEn: 'pending',
                        urlEs: '',
                        urlEn: '',
                        publishedDateEs: null,
                        publishedDateEn: null
                    }
                }
            };

            await Content.findByIdAndUpdate(content._id, updates);
            migratedCount++;

            if (migratedCount % 10 === 0) {
                console.log(`📈 Migrated ${migratedCount}/${contentsToMigrate.length} items...`);
            }
        }

        console.log(`✅ Migration completed successfully! Migrated ${migratedCount} items.`);
        console.log('🔧 Platform-specific data structure is now available for all content.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migratePlatformData().then(() => {
        console.log('🎉 Migration script completed');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = { migratePlatformData };