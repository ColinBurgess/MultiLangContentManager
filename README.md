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
- Kanban board for task management and workflow tracking
- Responsive user interface
- User preferences with theme customization
- MongoDB database for flexible content storage
- Word document parser for importing structured content

## 🔍 Perfect For

- YouTube content creators managing multilingual channels
- Social media managers handling content across multiple platforms
- Video production teams working with international audiences
- Anyone needing to organize and track multilingual digital content

## Features 🌟

- Dashboard for content management
- Statistics and analytics visualization
- Workflow management with Kanban board
- Backup and restore functionality
- Theme customization and user preferences
- Integration with external services
- Advanced logging and monitoring
- Bilingual content management (Spanish/English)
- Publication status tracking by language
- Direct access to published content from the interface
- Tagging system for categorization
- Enhanced security for database credentials
- Word document parsing for content import

## Project Structure 📁

```
MultiLangContentManager/
├── server/
│   ├── server.js         # Main server configuration
│   ├── routes/
│   │   ├── content.js    # Content API routes
│   │   └── task.js       # Task management API routes
│   └── models/
│       ├── Content.js    # MongoDB model for content
│       └── Task.js       # MongoDB model for tasks
├── client/
│   └── public/
│       ├── index.html    # Dashboard/main page
│       ├── stats.html    # Statistics page
│       ├── kanban.html   # Workflow/Kanban board
│       ├── backup.html   # Backup & restore page
│       ├── themes.html   # Theme preferences
│       ├── integrations.html # Integrations page
│       ├── new-content.html  # Content creation/editing form
│       ├── css/
│       │   └── styles.css    # Styles
│       └── js/
│           ├── list.js       # Logic for content list
│           ├── form.js       # Logic for edit form
│           ├── kanban.js     # Logic for kanban board
│           ├── stats.js      # Logic for statistics with GitHub-style calendar
│           ├── backup.js     # Logic for backup/restore
│           ├── themes.js     # Logic for theme preferences
│           ├── integrations.js # Logic for integrations
│           └── utils.js      # Utility functions
├── parser/                # Word document parsing module
│   ├── wordexporter.py    # Parser for structured text from Word
│   ├── __init__.py        # Module initialization
│   └── tests/             # Parser tests
│       ├── test_parser.py # Basic parser tests
│       ├── test_complex.py # Complex input tests
│       └── test_curl.py   # API submission tests
├── dev-scripts/           # Development and maintenance scripts
│   ├── migrations/        # Database migration scripts
│   │   ├── migrate-platform-data.js    # Platform data structure migration
│   │   ├── migrate-statuses.js         # Status field migration
│   │   └── safe-migrate-status.js      # Safe migration with backup
│   ├── testing/           # Testing and data generation scripts
│   │   ├── safe-insert-test-data.js    # Safe test data insertion
│   │   ├── insert-test-data.js         # Quick test data insertion
│   │   └── list-database-structure.js  # Database structure analysis
│   └── README.md          # Development scripts documentation
├── utils/
│   ├── credentials.js    # Credentials utility
│   └── logger.js         # Logging system
├── logs/                 # Log files
├── docs/                 # Documentation
│   └── README-KANBAN.md  # Kanban board documentation
├── scripts/
│   └── encrypt-credentials.js # Encryption script
├── LESSONS_LEARNED.md    # Critical lessons learned during development
└── package.json         # Dependencies and scripts
```

## Prerequisites 📋

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Python 3.6+ (for word document parser)

## Installation 🔧

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd MultiLangContentManager
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

## Development Scripts 🔧

The project includes a collection of development and maintenance scripts organized in the `dev-scripts/` directory:

### Database Migrations
- **Platform Data Migration**: Migrate existing content to support platform-specific status tracking
- **Status Field Migration**: Convert boolean published fields to descriptive status fields
- **Safe Migration**: Migration scripts with automatic backup and rollback capabilities

### Testing & Data Management
- **Test Data Insertion**: Scripts to safely insert test data for development
- **Database Structure Analysis**: Tools to examine and understand database schema
- **Data Cleanup**: Utilities for resetting development databases

### Usage
```bash
# Analyze current database structure
node dev-scripts/testing/list-database-structure.js

# Insert test data safely
node dev-scripts/testing/safe-insert-test-data.js

# Migrate to new data structure (if needed)
node dev-scripts/migrations/safe-migrate-status.js migrate
node dev-scripts/migrations/migrate-platform-data.js
```

For detailed documentation of all available scripts, see [`dev-scripts/README.md`](dev-scripts/README.md).

## Usage 🚀

1. Start the server:
   ```bash
   npm run dev     # Development mode with nodemon
   # or
   npm start       # Production mode
   ```

2. Open in the browser:
   ```
   http://localhost:3000
   ```

## User Guide 📘

### Dashboard

The main interface provides an overview of all content:

1. **Content List:**
   - Complete list of available content
   - Real-time search filter
   - Publication status indicators (ES/EN)
   - Quick access to view and edit options

2. **Publication Status:**
   - Green indicator: Published content (clickable, leads to published URL)
   - Yellow indicator: Pending content
   - Edit view allows changing publication status

### Statistics

The statistics page provides insights on your content:

1. **Overview Metrics:**
   - Total content count
   - Published content by language
   - Pending items

2. **Publication Calendar:**
   - GitHub-style contribution calendar showing publication activity
   - Interactive visualization of publication dates by day
   - Color intensity reflecting publication frequency
   - Year navigation to view historical data
   - Shows actual publication dates for both Spanish and English content

3. **Activity Log:**
   - Chronological view of recent publications
   - Filtering by language (Spanish/English)
   - Direct access to published content

4. **Additional Visualizations:**
   - Language distribution charts
   - Publication trends
   - Popular tags analysis

### Workflow Management (Kanban Board)

The Kanban board helps organize and track tasks related to your content:

1. **Task Columns:**
   - **To Do**: Tasks that need to be started
   - **In Progress**: Tasks currently being worked on
   - **Completed**: Finished tasks

2. **Task Management:**
   - Create tasks linked to specific content
   - Set due dates and assign to team members
   - Drag and drop tasks between status columns
   - Track content creation and publishing workflow

### Backup & Restore

Easily maintain and recover your data:

1. **Backup Options:**
   - Complete backup (all data)
   - Content-only backup
   - Include/exclude tasks and preferences
   - Format JSON output

2. **Restore Functionality:**
   - Import from backup files
   - Backup history tracking

### Theme Preferences

Customize your user experience:

1. **Theme Selection:**
   - Multiple dark themes (Dark, Deep Blue, Purple Night, Forest)
   - Coming soon: Light theme support

2. **View Settings:**
   - Information density control
   - Font size adjustments
   - Animation toggles

### Integrations

Connect with external services:

1. **Available Integrations:**
   - AI Translation
   - CMS connections
   - Notifications
   - Social media publishing
   - Cloud storage
   - Analytics

2. **API Access:**
   - API key management
   - Webhook configuration

### Content Management

Creating and editing content:

1. **Content Form:**
   - Complete form for all fields in both languages
   - Publication status controls
   - URLs for direct access to published content
   - Character counters for social media optimization

2. **Content Details:**
   - Detailed view with all information
   - Copy to clipboard functionality
   - Quick access to editing

## API Endpoints 🛣️

### Content

- `GET /api/contents` - Get all contents
- `POST /api/contents` - Create new content
- `GET /api/contents/:id` - Get single content item
- `PUT /api/contents/:id` - Update existing content
- `PATCH /api/contents/:id` - Update publication status
- `DELETE /api/contents/:id` - Delete content
- `GET /api/contents/search` - Search contents

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update existing task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

## Data Models 📊

### Content Model

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

### Task Model

- Title and description
- Status (draft, in-progress, done)
- Due date
- Assignee
- Related content reference
- Tags for categorization

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

## Troubleshooting 🔍

- Server not starting: Check MongoDB connection and credentials
- Tasks not updating: Verify proper ID formatting between frontend and MongoDB
- Content not displaying: Check browser console for API errors

## Word Document Parser 📄

The project includes a Python module to parse structured text (like that exported from Word) and transform it into the JSON format required for the API.

### Key Features

- Parses structured text in two different formats
- Extracts bilingual content (Spanish/English)
- Generates curl commands for the API
- Supports creation and updating of content
- Allows automatic detection of existing content by title

### Usage Methods

1. **Basic CLI (cli.py)** - For text analysis and curl command generation
2. **Automatic Detection (auto_detect_update.py)** - To automatically decide between creating or updating
3. **wordexporter.py Module** - Basic module-level functionality

**For detailed documentation**, including usage examples, supported formats, and available options, see the [Parser Documentation](./parser/README.md).

## Recent Updates 🆕

- **Automatic Content Detection**: Added functionality to automatically detect existing content by title and decide between creation or update
- **GitHub-Style Publication Calendar**: Added an interactive visualization similar to GitHub's contribution calendar to show publication activity by date
- **Language-Specific Publication Dates**: Updated the system to track and display separate publication dates for Spanish and English content
- **Activity Log Enhancement**: Improved the chronological activity log with language indicators and direct access to published content

## Future Enhancements 🚀

- Support for additional languages
- Advanced content analytics
- User authentication and role-based access
- Enhanced AI-powered translation integration
- Mobile application version