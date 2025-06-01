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

#### 📦 **GitHub Release Creation**
- Automatically creates GitHub Releases
- Includes release notes with commit information
- Links to CHANGELOG.md for detailed changes
- Provides installation instructions

#### 📊 **Comprehensive Logging**
- Detailed step-by-step logging
- Summary in GitHub Actions interface
- Warning notifications for version mismatches
- Success/failure status reporting

### Workflow Steps

1. **Checkout** - Retrieves repository code
2. **Version Extraction** - Reads version from `version.txt`
3. **Format Validation** - Ensures semantic versioning
4. **Duplicate Check** - Verifies tag doesn't exist
5. **Sync Verification** - Compares version.txt vs package.json
6. **Tag Creation** - Creates annotated git tag
7. **Release Creation** - Creates GitHub Release
8. **Summary Report** - Provides execution summary

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
- GitHub Release published
- Actions summary shows success

#### ⏭️ **Skip Case**
- Tag already exists
- Workflow completes without action
- Actions summary shows skipped

#### ❌ **Error Cases**
- Invalid version format → Workflow fails
- Missing `version.txt` → Workflow fails
- Git push permissions → Workflow fails

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
- **Documentation**: Auto-generates releases
- **CI/CD Ready**: Can trigger deployment pipelines

### Monitoring & Troubleshooting

#### **Checking Workflow Status**
1. Go to repository → Actions tab
2. Look for "Auto Tag on Version Change" workflow
3. Check individual run details for logs

#### **Common Issues**
- **Permission denied**: Check repository settings → Actions → General → Workflow permissions
- **Version format**: Ensure `version.txt` contains only `X.Y.Z` format
- **Sync warnings**: Run `npm run sync-version` to fix version mismatches

#### **Disabling Auto-Tag** (if needed)
```bash
# Rename or delete the workflow file
mv .github/workflows/auto-tag.yml .github/workflows/auto-tag.yml.disabled
```

### Security Considerations
- Uses built-in `GITHUB_TOKEN` (no additional secrets needed)
- Limited to `contents: write` permission
- Only triggers on `main` branch pushes
- Validates input format before execution

---

## 🔄 Future Workflow Ideas

Potential additional workflows to consider:

- **CI/CD Pipeline**: Deploy on new tags
- **Security Scanning**: Run security checks on releases
- **Documentation**: Auto-update docs on version changes
- **Notifications**: Slack/email notifications for releases
- **Testing**: Run test suites before tagging

---

*This automation enhances the existing version management system while maintaining manual control and safety.*