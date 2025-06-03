// MongoDB initialization script for MultiLangContentManager
// This script runs when MongoDB container starts for the first time

print('🚀 Initializing MultiLangContentManager database...');

// Switch to application database
db = db.getSiblingDB('multilang-content');

// Create application user (optional - for production)
// db.createUser({
//   user: 'multilang_user',
//   pwd: 'secure_password_here',
//   roles: [
//     { role: 'readWrite', db: 'multilang-content' }
//   ]
// });

// Create indexes for better performance
print('📊 Creating database indexes...');

// Content collection indexes
db.contents.createIndex({ "title": "text", "videoDescriptionEs": "text", "videoDescriptionEn": "text" });
db.contents.createIndex({ "publishedDateEs": -1 });
db.contents.createIndex({ "publishedDateEn": -1 });
db.contents.createIndex({ "statusEs": 1 });
db.contents.createIndex({ "statusEn": 1 });
db.contents.createIndex({ "tags": 1 });
db.contents.createIndex({ "createdAt": -1 });

// Tasks collection indexes
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "dueDate": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "contentId": 1 });

// Platform status indexes for efficient queries
db.contents.createIndex({ "platformStatus.youtube.statusEs": 1 });
db.contents.createIndex({ "platformStatus.youtube.statusEn": 1 });
db.contents.createIndex({ "platformStatus.tiktok.statusEs": 1 });
db.contents.createIndex({ "platformStatus.tiktok.statusEn": 1 });

print('✅ Database initialization completed successfully!');
print('📁 Database: multilang-content');
print('📋 Collections: contents, tasks');
print('🔍 Indexes created for optimal performance');

// Optional: Insert sample data for testing
// Uncomment the following lines to insert test data

/*
print('📝 Inserting sample data...');

db.contents.insertOne({
  title: "Sample Content - Docker Deployment",
  statusEs: "pending",
  statusEn: "pending",
  publishedEs: false,
  publishedEn: false,
  publishedDateEs: new Date("1970-01-01"),
  publishedDateEn: new Date("1970-01-01"),
  publishedUrlEs: "",
  publishedUrlEn: "",
  teleprompterEs: "Contenido de ejemplo para la implementación Docker",
  teleprompterEn: "Sample content for Docker deployment",
  videoDescriptionEs: "Descripción de ejemplo en español",
  videoDescriptionEn: "Sample description in English",
  platformStatus: {
    youtube: { statusEs: "pending", statusEn: "pending", urlEs: "", urlEn: "" },
    tiktok: { statusEs: "pending", statusEn: "pending", urlEs: "", urlEn: "" },
    instagram: { statusEs: "pending", statusEn: "pending", urlEs: "", urlEn: "" },
    twitter: { statusEs: "pending", statusEn: "pending", urlEs: "", urlEn: "" },
    facebook: { statusEs: "pending", statusEn: "pending", urlEs: "", urlEn: "" }
  },
  tags: ["docker", "sample", "test"],
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ Sample data inserted successfully!');
*/