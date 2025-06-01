# GitHub Actions Workflows

This directory contains automated workflows for the MultiLangContentManager project.

## 🏷️ Auto-Tag Workflow

### Purpose
Automatically creates git tags when `version.txt` or `package.json` is updated on the `main` branch.

### Trigger Conditions
- **Branches**: Only `main` branch
- **Files**: Changes to `version.txt` or `package.json`
- **Event**: Push to repository

### Features

#### ✅ **Smart Tag Creation**
- Reads version from `version.txt` (single source of truth)
- Creates semantic version tags (e.g., `v2.5.0`)
- Skips if tag already exists (prevents duplicates)

#### 🔍 **Validation & Safety**
- Validates semantic versioning format (`X.Y.Z`)
- Checks for existing tags before creation
- Verifies `version.txt` and `package.json` sync
- Uses GitHub Actions bot for git operations

#### 📦 **Modern GitHub Release Creation**
- Uses latest `actions/github-script@v7` (no deprecated warnings)
- Automatically creates GitHub Releases with enhanced metadata
- Includes release notes with commit information and automation details
- Links to CHANGELOG.md for detailed changes
- Provides installation instructions

#### 📊 **Comprehensive Logging**
- Detailed step-by-step logging
- Summary in GitHub Actions interface
- Warning notifications for version mismatches
- Success/failure status reporting with release URLs

### Workflow Steps

1. **Checkout** - Retrieves repository code
2. **Version Extraction** - Reads version from `version.txt`
3. **Format Validation** - Ensures semantic versioning
4. **Duplicate Check** - Verifies tag doesn't exist
5. **Sync Verification** - Compares version.txt vs package.json
6. **Tag Creation** - Creates annotated git tag
7. **Release Creation** - Creates GitHub Release (modern approach)
8. **Summary Report** - Provides execution summary

### Technical Updates

#### **Modern GitHub Actions**
- **Updated from**: `actions/create-release@v1` (deprecated)
- **Updated to**: `actions/github-script@v7` (current best practice)
- **Benefits**: No deprecated warnings, better error handling, enhanced metadata

#### **Enhanced Release Notes**
- Automation details (triggered by, workflow, commit, branch)
- Better formatted markdown with escaped code blocks
- Improved error handling with try/catch blocks
- Console logging for better debugging

### Usage Examples

#### Scenario 1: Update Version
```bash
# Update version
echo "2.6.0" > version.txt
npm run sync-version  # Sync with package.json
git add .
git commit -m "feat: v2.6.0 - New features"
git push origin main  # Triggers auto-tag workflow
```

#### Scenario 2: Manual Version Bump
```bash
npm run version-bump 2.7.0  # Updates both files
git add .
git commit -m "chore: bump version to 2.7.0"
git push origin main  # Triggers auto-tag workflow
```

### Expected Outputs

#### ✅ **Success Case**
- New git tag created: `v2.6.0`
- GitHub Release published with enhanced metadata
- Actions summary shows success with release URL

#### ⏭️ **Skip Case**
- Tag already exists
- Workflow completes without action
- Actions summary shows skipped

#### ❌ **Error Cases**
- Invalid version format → Workflow fails
- Missing `version.txt` → Workflow fails
- Git push permissions → Workflow fails
- Release creation errors → Detailed error logging

### Integration with Project

#### **Synergy with Existing Tools**
- Works with `version.txt` (automation source)
- Compatible with `sync-version.js` script
- Integrates with `npm run version-bump`
- Complements manual tagging workflow

#### **Benefits**
- **Automation**: No manual tag creation needed
- **Consistency**: Always tags when version changes
- **Safety**: Prevents duplicate tags
- **Documentation**: Auto-generates releases with enhanced metadata
- **CI/CD Ready**: Can trigger deployment pipelines
- **Modern**: Uses current GitHub Actions best practices

### Monitoring & Troubleshooting

#### **Checking Workflow Status**
1. Go to repository → Actions tab
2. Look for "Auto Tag on Version Change" workflow
3. Check individual run details for logs and release URLs

#### **Common Issues**
- **Permission denied**: Check repository settings → Actions → General → Workflow permissions
- **Version format**: Ensure `version.txt` contains only `X.Y.Z` format
- **Sync warnings**: Run `npm run sync-version` to fix version mismatches
- **Release creation**: Check logs for detailed error messages

#### **Disabling Auto-Tag** (if needed)
```bash
# Rename or delete the workflow file
mv .github/workflows/auto-tag.yml .github/workflows/auto-tag.yml.disabled
```

### Security Considerations
- Uses built-in GitHub Actions context and REST API
- No additional secrets needed beyond default `GITHUB_TOKEN`
- Limited to `contents: write` permission
- Only triggers on `main` branch pushes
- Validates input format before execution

### Recent Updates

#### **v2.6.0 Improvements**
- ✅ **Fixed deprecated warnings**: Replaced `actions/create-release@v1` with `actions/github-script@v7`
- ✅ **Enhanced error handling**: Added try/catch blocks for better debugging
- ✅ **Improved metadata**: Release notes now include automation details
- ✅ **Better logging**: Console output shows release URLs and detailed status

---

## 🔄 Future Workflow Ideas

Potential additional workflows to consider:

- **CI/CD Pipeline**: Deploy on new tags
- **Security Scanning**: Run security checks on releases
- **Documentation**: Auto-update docs on version changes
- **Notifications**: Slack/email notifications for releases
- **Testing**: Run test suites before tagging

---

*This automation enhances the existing version management system while maintaining manual control and safety, now with modern GitHub Actions practices.*