document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for buttons
    document.getElementById('backupAllBtn').addEventListener('click', () => createBackup('full'));
    document.getElementById('backupContentBtn').addEventListener('click', () => createBackup('content'));
    document.getElementById('restoreFile').addEventListener('change', handleFileSelection);
    document.getElementById('restoreBtn').addEventListener('click', restoreBackup);

    // Load backup history
    loadBackupHistory();
});

// Function to create a backup
function createBackup(type) {
    try {
        // Get selected options
        const includeTasks = document.getElementById('includeTasksCheck').checked;
        const includePreferences = document.getElementById('includePreferencesCheck').checked;
        const prettyPrint = document.getElementById('prettyPrintCheck').checked;

        // Get data for backup
        const backupData = {
            version: '1.0',
            type: type,
            timestamp: new Date().toISOString(),
            data: {}
        };

        // Always include content data in any type of backup
        const contentData = localStorage.getItem('contentData');
        if (contentData) {
            backupData.data.content = JSON.parse(contentData);
        }

        // Include Kanban tasks if selected
        if (includeTasks && type === 'full') {
            const kanbanTasks = localStorage.getItem('kanbanTasks');
            if (kanbanTasks) {
                backupData.data.kanban = JSON.parse(kanbanTasks);
            }
        }

        // Include preferences if selected
        if (includePreferences && type === 'full') {
            // Collect all cookies and settings
            const preferences = {
                cookies: {},
                settings: {}
            };

            // Get cookies
            document.cookie.split(';').forEach(cookie => {
                if (cookie.trim()) {
                    const [name, value] = cookie.trim().split('=');
                    preferences.cookies[name] = value;
                }
            });

            // Save other settings like theme, etc.
            const themePref = localStorage.getItem('theme');
            if (themePref) {
                preferences.settings.theme = themePref;
            }

            backupData.data.preferences = preferences;
        }

        // Generate JSON for download
        const backupJson = prettyPrint
            ? JSON.stringify(backupData, null, 2)
            : JSON.stringify(backupData);

        // Create Blob object for download
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create download element
        const a = document.createElement('a');
        a.href = url;
        a.download = `multilang_backup_${type}_${formatDateForFilename(new Date())}.json`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Save to backup history
        saveBackupToHistory(backupData, backupJson.length);

        // Show success notification
        showNotification('Backup created successfully', 'success');

    } catch (error) {
        console.error('Error creating backup:', error);
        showNotification('Error creating backup', 'error');
    }
}

// Save backup reference in history
function saveBackupToHistory(backupData, size) {
    // Get existing history or create new one
    const backupHistory = JSON.parse(localStorage.getItem('backupHistory') || '[]');

    // Prepare new record
    const newEntry = {
        timestamp: backupData.timestamp,
        type: backupData.type,
        size: formatFileSize(size),
        contents: generateContentSummary(backupData)
    };

    // Add to the beginning of history (most recent first)
    backupHistory.unshift(newEntry);

    // Limit to 10 entries
    if (backupHistory.length > 10) {
        backupHistory.pop();
    }

    // Save back to localStorage
    localStorage.setItem('backupHistory', JSON.stringify(backupHistory));

    // Update history in the interface
    loadBackupHistory();
}

// Load and display backup history
function loadBackupHistory() {
    const historyList = document.getElementById('backupHistoryList');
    const noBackupsMessage = document.getElementById('noBackupsMessage');

    // Get backup history
    const backupHistory = JSON.parse(localStorage.getItem('backupHistory') || '[]');

    // Show message if no history
    if (backupHistory.length === 0) {
        historyList.innerHTML = '';
        noBackupsMessage.style.display = 'block';
        return;
    }

    // Hide "no backups" message
    noBackupsMessage.style.display = 'none';

    // Generate rows for the table
    historyList.innerHTML = backupHistory.map(entry => `
        <tr>
            <td>${formatDate(new Date(entry.timestamp))}</td>
            <td><span class="badge ${entry.type === 'full' ? 'bg-primary' : 'bg-secondary'}">${entry.type === 'full' ? 'Complete' : 'Content Only'}</span></td>
            <td>${entry.size}</td>
            <td>${entry.contents}</td>
            <td>
                <button class="btn btn-sm btn-outline-light" disabled>
                    <i class="bi bi-download"></i> Download
                </button>
            </td>
        </tr>
    `).join('');
}

// Enable/disable restore button when a file is selected
function handleFileSelection() {
    const fileInput = document.getElementById('restoreFile');
    const restoreBtn = document.getElementById('restoreBtn');

    restoreBtn.disabled = !fileInput.files || fileInput.files.length === 0;
}

// Restore from a backup file
function restoreBackup() {
    const fileInput = document.getElementById('restoreFile');

    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('No file has been selected', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            // Parse file content
            const backupData = JSON.parse(event.target.result);

            // Verify version and structure
            if (!backupData.version || !backupData.data) {
                throw new Error('Invalid file format');
            }

            // Restore content data
            if (backupData.data.content) {
                localStorage.setItem('contentData', JSON.stringify(backupData.data.content));
            }

            // Restore Kanban tasks
            if (backupData.data.kanban) {
                localStorage.setItem('kanbanTasks', JSON.stringify(backupData.data.kanban));
            }

            // Restore preferences
            if (backupData.data.preferences) {
                // Restore settings
                if (backupData.data.preferences.settings) {
                    Object.keys(backupData.data.preferences.settings).forEach(key => {
                        localStorage.setItem(key, backupData.data.preferences.settings[key]);
                    });
                }

                // We don't restore cookies directly for security reasons
            }

            // Show success notification
            showNotification('Data restored successfully', 'success');

            // Reload page to apply changes
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error restoring backup:', error);
            showNotification('Error restoring backup: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('backupNotification');
    notification.textContent = message;
    notification.className = `copy-notification ${type}`;
    notification.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Generate backup content summary
function generateContentSummary(backupData) {
    const summary = [];

    if (backupData.data.content) {
        const contentCount = Array.isArray(backupData.data.content) ? backupData.data.content.length : 'N/A';
        summary.push(`${contentCount} contents`);
    }

    if (backupData.data.kanban) {
        const tasksCount = Array.isArray(backupData.data.kanban) ? backupData.data.kanban.length : 'N/A';
        summary.push(`${tasksCount} tasks`);
    }

    if (backupData.data.preferences) {
        summary.push('Preferences');
    }

    return summary.join(', ');
}

// Format date for filename
function formatDateForFilename(date) {
    return date.toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
}

// Format date for display
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}