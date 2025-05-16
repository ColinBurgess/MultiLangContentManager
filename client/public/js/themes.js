document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme and preferences
    initThemePage();

    // Set up event listeners
    setupEventListeners();

    // Display the current font size
    updateFontSizeDisplay();

    // Function to initialize the application with consistent settings
    initializeWithTheme();
});

// Variable to control logging (must match theme-loader.js)
const THEMES_LOGGING_ENABLED = false;

// Initialize theme based on saved preferences
function initThemePage() {
    // Load preferences
    loadThemePreferences();

    // Mark the corresponding option as active
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
            const radioInput = option.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;
        } else {
            option.classList.remove('active');
        }
    });

    // Load view settings (only to initialize controls)
    loadThemeControlValues();
}

// Set up listeners for page events
function setupEventListeners() {
    // Event listeners for theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const selectedTheme = this.dataset.theme;

            // Log theme change
            sendLogToServer(`Theme changed to "${selectedTheme}"`, 'info', {
                previousTheme: localStorage.getItem('theme') || 'default',
                newTheme: selectedTheme,
                userAction: true
            });

            // Mark selected option
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');

            // Select radio button
            const radioInput = this.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;

            // Save theme in localStorage
            localStorage.setItem('theme', selectedTheme);

            // Notify other tabs about theme change
            localStorage.setItem('theme_updated', Date.now().toString());

            // Apply to body for instant preview
            document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');
            document.body.classList.add(`theme-${selectedTheme}`);
        });
    });

    // Event listener for save theme button
    document.getElementById('saveThemeBtn').addEventListener('click', function() {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;

        // Save theme in localStorage
        localStorage.setItem('theme', selectedTheme);

        // Apply theme to this page immediately
        applyTheme(selectedTheme);

        // Send message to other open windows to update theme
        localStorage.setItem('theme_updated', Date.now().toString());

        // Check if user wants to reload all pages
        const reloadPages = document.getElementById('reloadPagesCheck')?.checked;

        if (reloadPages) {
            // Show notification that pages will be reloaded
            showNotification('Updating all pages...', 'success');

            // Small delay before reloading so notification is visible
            setTimeout(() => {
                // Mark in localStorage that all pages should be reloaded
                localStorage.setItem('theme_reload_required', 'true');

                // Reload this page
                window.location.reload();
            }, 1000);
        } else {
            // Show normal notification
            showNotification('Theme preferences saved', 'success');
        }

        // Log saved settings
        sendLogToServer('Theme settings saved', 'info', {
            theme: selectedTheme,
            userAction: true
        });
    });

    // Event listener for font size
    const fontSizeRange = document.getElementById('fontSizeRange');
    if (fontSizeRange) {
        fontSizeRange.addEventListener('input', function() {
            updateFontSizeDisplay();
        });
    }

    // Event listener for saving view settings
    document.getElementById('saveViewSettingsBtn').addEventListener('click', function() {
        saveViewSettings();
        showNotification('View settings saved', 'success');
    });
}

// Apply the selected theme
function applyTheme(theme) {
    // Remove all theme classes from body
    document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');

    // Add class for selected theme
    document.body.classList.add(`theme-${theme}`);
}

// Save view settings
function saveViewSettings() {
    // Density
    const density = document.querySelector('input[name="density"]:checked').value;

    // Font size
    const fontSize = document.getElementById('fontSizeRange').value;

    // Additional preferences
    const animations = document.getElementById('animationsSwitch').checked;
    const autoSave = document.getElementById('autoSaveSwitch').checked;
    const hideInfoMessages = document.getElementById('hideInfoMessagesSwitch').checked;

    // Save to localStorage
    const viewSettings = {
        density,
        fontSize,
        animations,
        autoSave,
        hideInfoMessages
    };

    localStorage.setItem('viewSettings', JSON.stringify(viewSettings));

    // Apply changes immediately
    if (typeof applyViewSettings === 'function') {
        // If the function exists in utils.js, use it
        applyViewSettings();
    } else {
        // If not, apply basic changes here
        applyThemeViewSettings(viewSettings);
    }

    // Notify other windows/tabs about the change
    localStorage.setItem('viewSettings_updated', Date.now().toString());

    // Log saved settings
    sendLogToServer('View settings saved', 'info', viewSettings);
}

// Load values in view settings controls
function loadThemeControlValues() {
    // Get saved settings or use default values
    const defaultSettings = {
        density: 'default',
        fontSize: '100',
        animations: true,
        autoSave: true,
        hideInfoMessages: false
    };

    const savedSettings = JSON.parse(localStorage.getItem('viewSettings')) || defaultSettings;

    // Set values in controls
    document.getElementById(`density${capitalizeFirstLetter(savedSettings.density)}`).checked = true;
    document.getElementById('fontSizeRange').value = savedSettings.fontSize;
    document.getElementById('animationsSwitch').checked = savedSettings.animations;
    document.getElementById('autoSaveSwitch').checked = savedSettings.autoSave;
    document.getElementById('hideInfoMessagesSwitch').checked = savedSettings.hideInfoMessages;
}

// Apply view settings
function applyThemeViewSettings(settings) {
    if (!settings) {
        console.error('No view settings were provided');
        return;
    }

    // Apply font size
    document.documentElement.style.fontSize = `${settings.fontSize}%`;

    // Apply information density
    document.body.classList.remove('density-compact', 'density-default', 'density-comfortable');
    document.body.classList.add(`density-${settings.density}`);

    // Apply animations
    document.body.classList.toggle('no-animations', !settings.animations);

    // Hide informational messages if needed
    if (settings.hideInfoMessages) {
        document.querySelectorAll('.alert-info').forEach(alert => {
            alert.style.display = 'none';
        });
    }
}

// Load theme preferences
function loadThemePreferences() {
    // This function can be expanded to load more theme-related preferences
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return { theme: savedTheme };
}

// Update the font size display
function updateFontSizeDisplay() {
    const fontSizeValue = document.getElementById('fontSizeRange').value;
    document.getElementById('fontSizeDisplay').textContent = `${fontSizeValue}%`;
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('themeNotification');
    notification.textContent = message;
    notification.className = `copy-notification ${type}`;
    notification.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to initialize the application with consistent settings
function initializeWithTheme() {
    // Create an interface element to offer the reload option
    document.addEventListener('DOMContentLoaded', function() {
        const cardBody = document.querySelector('#saveThemeBtn').parentElement;

        if (cardBody) {
            // Check if the checkbox already exists to avoid duplicates
            if (!document.getElementById('reloadPagesCheck')) {
                const reloadOption = document.createElement('div');
                reloadOption.className = 'form-check mt-3';
                reloadOption.innerHTML = `
                    <input class="form-check-input" type="checkbox" id="reloadPagesCheck" checked>
                    <label class="form-check-label" for="reloadPagesCheck">
                        Apply to all open pages
                    </label>
                    <div class="form-text">Recommended to ensure that the theme is correctly applied across all pages.</div>
                `;

                cardBody.appendChild(reloadOption);
            }
        }
    });
}

// Function to send logs to the server (similar to theme-loader.js)
function sendLogToServer(message, level = 'debug', data = null) {
    // If logging is disabled, do nothing
    if (!THEMES_LOGGING_ENABLED) return;

    try {
        const logEntry = {
            message,
            level,
            data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            pageTitle: document.title,
            url: window.location.href,
            theme: localStorage.getItem('theme') || 'default',
            source: 'themes.js'
        };

        // Send log to server
        fetch('/api/logs/theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logEntry)
        }).catch(err => {
            console.error('Error sending log to server:', err);
        });
    } catch (error) {
        console.error('Error preparing log to send:', error);
    }
}