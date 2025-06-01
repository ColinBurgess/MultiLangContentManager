# MultiLangContentManager

A flexible, full-stack web application for managing and organizing multilingual video content across different publishing platforms.

## 🌐 Description

MultiLangContentManager helps content creators streamline their workflow by providing a centralized hub to manage scripts, descriptions, and publishing status for video content in multiple languages. Originally designed for Spanish and English content, it's evolving toward a configurable solution that supports any language combination.

## ✨ Key Features

- Manage content scripts and descriptions in multiple languages
- **Advanced platform status tracking** with independent management per platform and language
- **Interactive platform link popups** for quick access to published content
- Track publication status per language with direct access to published content
- Organize content with a tagging system
- Create optimized descriptions for various platforms (YouTube, TikTok, Twitter, Facebook, Instagram)
- Real-time search functionality
- Copy-to-clipboard functionality for easy content transfer
- Kanban board for task management and workflow tracking
- Responsive user interface
- User preferences with theme customization
- MongoDB database with optimized nested object handling
- Word document parser for importing structured content
- **Enhanced debugging tools and systematic troubleshooting**

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
- **Platform-specific publication status** tracking with independent URLs per platform
- **Interactive popup system** for quick access to published platform links
- Direct access to published content from the interface
- Tagging system for categorization
- Enhanced security for database credentials
- Word document parsing for content import
- **Systematic debugging methodology** with comprehensive error tracking

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
   - **Advanced platform status controls** with independent tracking per platform
   - **Platform-specific URLs** for YouTube, TikTok, Instagram, Twitter, and Facebook
   - **Interactive status indicators** with clickable access to published content
   - Character counters for social media optimization

2. **Content Details:**
   - **Enhanced platform status visualization** with color-coded indicators
   - **Popup system for platform links** - click status indicators to access published URLs
   - Copy to clipboard functionality
   - Quick access to editing

3. **Platform Management:**
   - Independent status tracking for each platform (YouTube, TikTok, Instagram, Twitter, Facebook)
   - Separate publication dates and URLs per platform and language
   - Visual indicators for pending, in-progress, and published states

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
- **Enhanced platform status system** with nested structure per platform
- **Platform-specific URLs and publication dates** (YouTube, TikTok, Instagram, Twitter, Facebook)
- Teleprompter text
- Descriptions for different platforms:
  - YouTube
  - TikTok
  - Instagram
  - Twitter (X)
  - Facebook
- Pinned comments

**Platform Status Structure:**
```javascript
platformStatus: {
  youtube: { statusEs: 'pending', statusEn: 'published', urlEs: '', urlEn: 'https://...' },
  tiktok: { statusEs: 'published', statusEn: 'pending', urlEs: 'https://...', urlEn: '' },
  instagram: { statusEs: 'pending', statusEn: 'pending', urlEs: '', urlEn: '' },
  // ... additional platforms
}
```

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

### Version Management

The project uses both `package.json` and `version.txt` for version tracking:

- **`package.json`**: Standard npm version for dependencies and Node.js ecosystem
- **`version.txt`**: Plain text version for automation, CI/CD, and deployment scripts

#### Git Tags & Semantic Versioning

The project follows **Semantic Versioning** (semver) with comprehensive git tagging:

- **Format**: `v{MAJOR}.{MINOR}.{PATCH}` (e.g., `v2.5.0`)
- **Complete Coverage**: Every version in the changelog has a corresponding git tag
- **Professional Workflow**: Tags enable proper release management and version navigation

**Key Benefits:**
- 🏷️ **Easy Navigation**: `git checkout v2.4.0` to switch to any version
- 📦 **Release Automation**: CI/CD systems can trigger on tag pushes
- 🔍 **Change Tracking**: `git diff v2.3.0..v2.4.0` to see differences
- 📊 **GitHub Releases**: Tags automatically appear in GitHub's release section

**Working with Tags:**

```bash
# List all tags in semantic order
git tag --sort=version:refname

# View a specific version
git checkout v2.4.0

# See changes between versions
git diff v2.3.0..v2.4.0

# View tag information and commit
git show v2.4.0

# Return to latest development
git checkout main

# Push tags to remote (for releases)
git push origin --tags
```

**Tag Structure:**
- **v1.x.x**: Initial development and feature additions
- **v2.0.0**: Major restructure milestone
- **v2.4.0**: Platform status system and documentation improvements
- **v2.5.0**: Complete English translation and version management system

#### GitHub Actions Automation 🤖

The project includes automated GitHub Actions for streamlined version management:

**Auto-Tag Workflow:**
- **Trigger**: Automatically runs when `version.txt` or `package.json` changes on `main` branch
- **Features**:
  - Creates semantic version tags (e.g., `v2.6.0`)
  - Validates version format before tagging
  - Prevents duplicate tag creation
  - Verifies version synchronization between files
  - Auto-generates GitHub Releases with changelog links

**Workflow Benefits:**
- 🔄 **Automation**: No manual tag creation needed
- ✅ **Consistency**: Always tags when version changes
- 🛡️ **Safety**: Built-in validation and duplicate prevention
- 📦 **Releases**: Auto-creates GitHub Releases with metadata
- 🔍 **Monitoring**: Comprehensive logging and status reporting

**Usage Examples:**
```bash
# Scenario 1: Update version and trigger auto-tag
echo "2.6.0" > version.txt
npm run sync-version
git add . && git commit -m "feat: v2.6.0 - New features"
git push origin main  # Triggers auto-tag workflow

# Scenario 2: Use version bump script
npm run version-bump 2.7.0
git add . && git commit -m "chore: bump to v2.7.0"
git push origin main  # Triggers auto-tag workflow
```

**Monitoring**: Check repository → Actions tab → "Auto Tag on Version Change" workflow for execution logs and status.

For detailed workflow documentation, see [`.github/workflows/README.md`](.github/workflows/README.md).

#### Synchronizing Versions

```bash
# Sync version.txt with current package.json version
npm run sync-version

# Update both files to a new version
npm run version-bump 2.6.0
```

#### API Version Endpoint

The server exposes the current version at `/api/version` endpoint for monitoring and deployment verification.

### Database Backup

1. Export data:
   ```
```

## Changelog 📋

To see the complete history of changes and improvements to the project, check the [CHANGELOG.md](CHANGELOG.md). This document contains:

- **Complete chronology**: All changes since project creation
- **Categorization by types**: Features, fixes, UI improvements, documentation, etc.
- **Technical details**: Detailed description of each important change
- **Git tag references**: Each version has a corresponding git tag (e.g., `v2.5.0`)
- **Semantic versioning**: Version tracking using semantic versioning standards

**Navigation Tip**: Use `git tag --sort=version:refname` to see all tagged versions, then `git checkout v{version}` to explore any specific release.