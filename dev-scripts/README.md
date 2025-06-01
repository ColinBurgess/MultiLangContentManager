# Development Scripts

This directory contains development scripts for the MultiLangContentManager project. They are organized by categories to facilitate their use and maintenance.

## 🗂️ Structure

```
dev-scripts/
├── migrations/     # Database migration scripts
├── testing/        # Scripts for testing and test data
└── README.md       # This file
```

## 🔄 Migrations

Scripts to migrate and update database data safely.

### `migrations/migrate-platform-data.js`
**Purpose:** Migrates existing content to use the new platform-specific `platformStatus` structure.

**When to use:** After updating the data model to support platform-specific statuses.

**Usage:**
```bash
cd /project/path
node dev-scripts/migrations/migrate-platform-data.js
```

**What it does:**
- Finds content without `platformStatus` structure
- Migrates existing statuses (`statusEs`/`statusEn`) to YouTube as main platform
- Initializes all other platforms as `pending`
- Maintains backward compatibility

### `migrations/migrate-statuses.js`
**Purpose:** Migrates boolean `publishedEs`/`publishedEn` fields to more descriptive statuses.

**Usage:**
```bash
node dev-scripts/migrations/migrate-statuses.js
```

**What it does:**
- Converts `publishedEs: true` → `statusEs: 'published'`
- Converts `publishedEs: false` → `statusEs: 'pending'`
- Same for EN fields

### `migrations/safe-migrate-status.js`
**Purpose:** Safe version of the above script with backup and rollback capability.

**Usage:**
```bash
# Migrate with backup
node dev-scripts/migrations/safe-migrate-status.js migrate

# Revert changes (if something goes wrong)
node dev-scripts/migrations/safe-migrate-status.js rollback
```

**Features:**
- ✅ Creates automatic backup before migrating
- ✅ Allows complete rollback
- ✅ Safety checks
- ✅ User confirmation

## 🧪 Testing

Scripts to generate test data and analyze database structure.

### `testing/safe-insert-test-data.js`
**Purpose:** Safely inserts test data for testing.

**Usage:**
```bash
node dev-scripts/testing/safe-insert-test-data.js
```

**Features:**
- ✅ Checks existing data before inserting
- ✅ Creates automatic backup if data exists
- ✅ Asks for user confirmation
- ✅ Option to clean existing data

**Data it inserts:**
- 4 example contents with different statuses
- Combinations of `published`/`pending` for ES/EN
- `in-progress` statuses for testing

### `testing/insert-test-data.js`
**Purpose:** Simple version to quickly insert test data.

**Usage:**
```bash
node dev-scripts/testing/insert-test-data.js
```

**⚠️ Warning:** Doesn't create backup, only use on development databases.

### `testing/list-database-structure.js`
**Purpose:** Analyzes and shows complete database structure.

**Usage:**
```bash
node dev-scripts/testing/list-database-structure.js
```

**What it shows:**
- All collections in the database
- Number of documents per collection
- Field structure of each document
- Data examples to understand the schema

## 🚀 How to Use These Scripts

### Prerequisites
1. Node.js installed
2. MongoDB running
3. Environment variables configured (`.env`)

### Required Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/video-content-organizer
```

### Recommended Order for New Setup

1. **Analyze current structure:**
   ```bash
   node dev-scripts/testing/list-database-structure.js
   ```

2. **Insert test data (if needed):**
   ```bash
   node dev-scripts/testing/safe-insert-test-data.js
   ```

3. **Migrate to new structure (if needed):**
   ```bash
   node dev-scripts/migrations/safe-migrate-status.js migrate
   node dev-scripts/migrations/migrate-platform-data.js
   ```

### For Daily Development

- **Clean and reset data:** Use `safe-insert-test-data.js`
- **Verify structure:** Use `list-database-structure.js`
- **Migrate changes:** Use `migrations/` scripts

## ⚠️ Important

- **ALWAYS** backup before running migration scripts in production
- Test all scripts in a development environment first
- `safe-*` scripts are safer but slower
- Verify that environment variables point to the correct database

## 🔧 Maintenance

- When adding new scripts, document them here
- Include the purpose, usage, and what it does exactly
- Mark obsolete scripts and explain alternatives
- Update this README when procedures change

## 📝 Logs

Scripts generate detailed logs. Check them if something fails:
- ✅ = Successful operation
- ❌ = Error requiring attention
- ⚠️ = Warning, review but not critical