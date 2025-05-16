# MultiLangContentManager

A flexible, full-stack web application for managing and organizing multilingual video content across different publishing platforms.

## 🌐 Description

MultiLangContentManager helps content creators streamline their workflow by providing a centralized hub to manage scripts, descriptions, and publishing status for video content in multiple languages. Originally designed for Spanish and English content, it's evolving toward a configurable solution that supports any language combination.

## ✨ Key Features

- Manage content scripts and descriptions in multiple languages
- Track publication status per language with direct access to published content
- Organize content with a tagging system
- Create optimized descriptions for various platforms (YouTube, TikTok, Twitter, Facebook)
- Real-time search functionality
- Copy-to-clipboard functionality for easy content transfer
- Responsive user interface
- User preferences saved via cookies
- MongoDB database for flexible content storage

## 🔍 Perfect For

- YouTube content creators managing multilingual channels
- Social media managers handling content across multiple platforms
- Video production teams working with international audiences
- Anyone needing to organize and track multilingual digital content

## Features 🌟

- Bilingual content management (Spanish/English)
- Publication status tracking by language
- Direct access to published content from the interface
- Tagging system for categorization
- Advanced search in both languages
- Social media link management
- Responsive user interface
- Enhanced security for database credentials
- User preferences via cookies

## Project Structure 📁

```
VideoContentCreationOrganizer/
├── server/
│   ├── server.js         # Main server configuration
│   ├── routes/
│   │   └── content.js    # Content API routes
│   └── models/
│       └── Content.js    # MongoDB model
├── client/
│   └── public/
│       ├── index.html    # Main page
│       ├── new-content.html # Creation/editing form
│       ├── css/
│       │   └── styles.css # Styles
│       └── js/
│           ├── list.js   # Logic for content list
│           ├── form.js   # Logic for edit form
│           └── utils.js  # Utility functions
├── utils/
│   ├── credentials.js    # Credentials utility
│   └── logger.js         # Logging system
├── logs/                 # Log files
├── scripts/
│   └── encrypt-credentials.js # Encryption script
└── package.json         # Dependencies and scripts
```

## Prerequisites 📋

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation 🔧

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd VideoContentCreationOrganizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configurations.

4. Encrypt MongoDB credentials:
   ```bash
   node scripts/encrypt-credentials.js
   ```
   Follow the on-screen instructions to set up credentials securely.

## Usage 🚀

1. Start the server:
   ```bash
   npm start
   ```

2. Open in the browser:
   ```
   http://localhost:3000
   ```

## User Guide 📘

### Content Management

The application allows you to manage bilingual content for video productions:

1. **Main View:**
   - List of all available content
   - Publication status indicators (ES/EN)
   - Real-time search filter

2. **Publication Status:**
   - Green indicator: Published content
   - Yellow indicator: Pending content
   - Green indicators are clickable and lead directly to the published content

3. **Create/Edit Content:**
   - Complete form for all fields in both languages
   - Publication status control (published/pending)
   - URLs for direct access to published content
   - Character limiters for social networks

4. **Visualization:**
   - Detailed view with all information
   - Copy to clipboard functionality
   - Quick access to editing from the detailed view

### User Preferences

The application remembers certain user preferences:

- The informative message about ES/EN indicators can be closed
- The preference is saved in a cookie for 1 year
- Temporary notifications when copying text to clipboard

## API Endpoints 🛣️

### Content

- `GET /api/contents` - Get all contents
- `POST /api/contents` - Create new content
- `PUT /api/contents/:id` - Update existing content
- `PATCH /api/contents/:id` - Update publication status
- `DELETE /api/contents/:id` - Delete content
- `GET /api/contents/search` - Search contents

## Data Model 📊

The data model includes fields for:

- Basic information (title, tags)
- Bilingual content (ES/EN)
- Publication status by language
- Published content URLs
- Teleprompter text
- Descriptions for different platforms:
  - YouTube
  - TikTok
  - Twitter (X)
  - Facebook
- Pinned comments

## Security 🔒

The project implements several security measures:

1. **Encrypted Credentials:**
   - MongoDB credentials are stored securely
   - Use of AES-256-GCM encryption
   - Unique salt for each installation

2. **Best Practices:**
   - Environment variables for sensitive configuration
   - Input sanitization
   - Data validation
   - Logging system for auditing

## Maintenance 🔧

### Database Backup

1. Export data:
   ```bash
   mongodump --uri="[your-mongodb-uri]" --out=./backup
   ```

2. Import data:
   ```bash
   mongorestore --uri="[your-mongodb-uri]" ./backup
   ```

### Updates

1. Get latest changes:
   ```bash
   git pull origin main
   ```

2. Update dependencies:
   ```bash
   npm install
   ```

3. Apply migrations if they exist:
   ```bash
   npm run migrate
   ```

## Troubleshooting 🔍

### Common Issues

1. **MongoDB Connection Error:**
   - Verify that MongoDB is running
   - Check credentials in .env
   - Verify network connectivity

2. **CORS Errors:**
   - Verify CORS configuration in server.js
   - Check origin of requests

3. **Cookies and Preferences:**
   - If preferences are not being saved, check cookie configuration
   - Clear browser cookies if unexpected behavior occurs

## Contributing 🤝

1. Fork the repository
2. Create feature branch: `git checkout -b feature/NewFeature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/NewFeature`
5. Create Pull Request

## License 📄

This project is under the MIT License - see the [LICENSE.md](LICENSE.md) file for details