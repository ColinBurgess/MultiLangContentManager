/**
 * Theme Debug Logger
 * System for debugging theme loading and application
 */

// Logger configuration
const ThemeDebugger = {
    enabled: false,  // Disabled by default
    logToConsole: false,
    logToUI: false,
    logToStorage: false,
    logToServer: false,  // New option to send logs to server
    maxLogEntries: 100,
    logPrefix: '🔍 [Theme Debug]',

    // Container for in-memory logs
    logs: [],

    // Initialize
    init: function() {
        if (!this.enabled) return;

        this.log('ThemeDebugger initialized', 'info');
        this.logBrowserInfo();
        this.logStorageState();

        // Check if document.body exists
        if (document.body) {
            this.logStylesheets();
            this.logCurrentTheme();
            this.logBodyClasses();

            // Monitor body class changes
            this.monitorBodyClassChanges();
        } else {
            this.log('document.body not yet available, waiting...', 'warning');

            // Wait for document.body to be available
            const waitForBody = setInterval(() => {
                if (document.body) {
                    clearInterval(waitForBody);
                    this.log('document.body now available', 'success');
                    this.logStylesheets();
                    this.logCurrentTheme();
                    this.logBodyClasses();

                    // Monitor body class changes
                    this.monitorBodyClassChanges();
                }
            }, 10); // Check every 10ms
        }

        // Start localStorage monitor
        this.initStorageMonitor();

        // Create debug UI if enabled
        if (this.logToUI) {
            document.addEventListener('DOMContentLoaded', () => this.createDebugUI());
        }
    },

    // Log a new entry
    log: function(message, level = 'debug', data = null) {
        if (!this.enabled) return;

        // Create log entry
        const entry = {
            timestamp: new Date().toISOString(),
            message: message,
            level: level,
            data: data
        };

        // Add to in-memory logs list
        this.logs.push(entry);
        if (this.logs.length > this.maxLogEntries) {
            this.logs.shift(); // Remove oldest if limit exceeded
        }

        // Output to console if enabled
        if (this.logToConsole) {
            const style = this.getLogStyle(level);
            console.log(`${this.logPrefix} %c${level.toUpperCase()}%c ${message}`, style, 'color: inherit', data || '');
        }

        // Send to server if enabled and not a basic debug level
        if (this.logToServer && level !== 'debug') {
            this.sendLogToServer(message, level, data);
        }

        // Store in localStorage if enabled
        if (this.logToStorage) {
            this.saveLogToStorage(entry);
        }

        // Update UI if available and enabled
        if (this.logToUI) {
            const debugPanel = document.getElementById('theme-debug-logs');
            if (debugPanel) {
                this.updateDebugUI(entry);
            }
        }
    },

    // Send log to server
    sendLogToServer: function(message, level = 'debug', data = null) {
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
                source: 'ThemeDebugger'
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
    },

    // Get browser and environment information
    logBrowserInfo: function() {
        const info = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            url: window.location.href,
            timestamp: new Date().toString(),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
        };

        this.log('Browser information', 'info', info);
    },

    // Get current localStorage state
    logStorageState: function() {
        const themeData = {
            theme: localStorage.getItem('theme'),
            theme_updated: localStorage.getItem('theme_updated'),
            theme_reload_required: localStorage.getItem('theme_reload_required'),
            viewSettings: localStorage.getItem('viewSettings')
        };

        this.log('Current localStorage state', 'info', themeData);
    },

    // Log loaded stylesheets
    logStylesheets: function() {
        const stylesheets = [];
        for (const sheet of document.styleSheets) {
            try {
                stylesheets.push({
                    href: sheet.href,
                    disabled: sheet.disabled,
                    media: sheet.media.mediaText,
                    type: sheet.type
                });
            } catch (e) {
                stylesheets.push({
                    href: sheet.href,
                    error: "Cannot access this stylesheet (CORS)"
                });
            }
        }

        this.log(`${stylesheets.length} stylesheets loaded`, 'info', stylesheets);
    },

    // Log current theme
    logCurrentTheme: function() {
        const currentTheme = localStorage.getItem('theme') || 'default';
        this.log(`Current theme: ${currentTheme}`, 'info');
    },

    // Log body CSS classes
    logBodyClasses: function() {
        // Check if body exists
        if (!document.body) {
            this.log('Cannot access document.body to register classes', 'error');
            return;
        }

        const classes = document.body.className.split(' ').filter(c => c.trim() !== '');
        this.log(`Body classes: ${classes.join(', ') || '(none)'}`, 'info', classes);
    },

    // Monitor localStorage changes
    initStorageMonitor: function() {
        window.addEventListener('storage', (event) => {
            if (event.key && (
                event.key.includes('theme') ||
                event.key.includes('view')
            )) {
                this.log(`Change in localStorage: ${event.key}`, 'info', {
                    oldValue: event.oldValue,
                    newValue: event.newValue
                });

                // Re-log state after change
                setTimeout(() => {
                    this.logStorageState();
                    this.logBodyClasses();
                }, 100);
            }
        });
    },

    // Monitor body class changes
    monitorBodyClassChanges: function() {
        // Check if body exists
        if (!document.body) {
            this.log('Cannot monitor document.body, not available', 'error');
            return;
        }

        // Use MutationObserver to detect changes in body class attribute
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const classes = document.body.className.split(' ').filter(c => c.trim() !== '');
                    this.log(`⚠️ Body classes modified`, 'warning', classes);
                }
            });
        });

        observer.observe(document.body, { attributes: true });
    },

    // Create UI for viewing logs
    createDebugUI: function() {
        // If already exists, don't create another
        if (document.getElementById('theme-debug-panel')) return;

        // Create elements
        const debugPanel = document.createElement('div');
        debugPanel.id = 'theme-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 0;
            right: 0;
            width: 50%;
            height: 300px;
            background: rgba(0, 0, 0, 0.85);
            color: #fff;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            display: none;
            flex-direction: column;
            border-top-left-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        `;

        // Header with controls
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 8px;
            background: #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #555;
        `;
        header.innerHTML = `
            <div>🔍 Theme Debugger</div>
            <div>
                <button id="theme-debug-clear" style="background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 4px; margin-right: 5px;">Limpiar</button>
                <button id="theme-debug-refresh" style="background: #0d6efd; color: white; border: none; padding: 2px 8px; border-radius: 4px; margin-right: 5px;">Refrescar</button>
                <button id="theme-debug-close" style="background: #6c757d; color: white; border: none; padding: 2px 8px; border-radius: 4px;">Cerrar</button>
            </div>
        `;

        // Log container
        const logContainer = document.createElement('div');
        logContainer.id = 'theme-debug-logs';
        logContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        `;

        // Footer with info
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 6px 8px;
            background: #333;
            border-top: 1px solid #555;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
        `;
        footer.innerHTML = `
            <div>Page: <span id="theme-debug-page">${window.location.pathname}</span></div>
            <div>Theme: <span id="theme-debug-theme">${localStorage.getItem('theme') || 'default'}</span></div>
        `;

        // Assemble panel
        debugPanel.appendChild(header);
        debugPanel.appendChild(logContainer);
        debugPanel.appendChild(footer);

        // Add to document
        document.body.appendChild(debugPanel);

        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'theme-debug-toggle';
        toggleButton.innerText = '🔍';
        toggleButton.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #333;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(toggleButton);

        // Add events
        toggleButton.addEventListener('click', () => {
            const panel = document.getElementById('theme-debug-panel');
            if (panel.style.display === 'none') {
                panel.style.display = 'flex';
                this.refreshDebugUI();
            } else {
                panel.style.display = 'none';
            }
        });

        document.getElementById('theme-debug-close').addEventListener('click', () => {
            document.getElementById('theme-debug-panel').style.display = 'none';
        });

        document.getElementById('theme-debug-clear').addEventListener('click', () => {
            this.logs = [];
            this.refreshDebugUI();
            this.log('Logs cleared', 'info');
        });

        document.getElementById('theme-debug-refresh').addEventListener('click', () => {
            this.logStylesheets();
            this.logStorageState();
            this.logBodyClasses();
            this.refreshDebugUI();
        });

        // Show initial logs
        this.refreshDebugUI();
    },

    // Refresh all logs in UI
    refreshDebugUI: function() {
        const container = document.getElementById('theme-debug-logs');
        if (!container) return;

        container.innerHTML = '';

        this.logs.forEach(log => {
            this.appendLogToUI(log, container);
        });

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;

        // Update footer info
        document.getElementById('theme-debug-theme').textContent = localStorage.getItem('theme') || 'default';
    },

    // Add a specific log to UI
    updateDebugUI: function(logEntry) {
        const container = document.getElementById('theme-debug-logs');
        if (!container) return;

        this.appendLogToUI(logEntry, container);

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    // Method to add a log to UI
    appendLogToUI: function(log, container) {
        const colors = {
            debug: '#6c757d',
            info: '#0dcaf0',
            warning: '#ffc107',
            error: '#dc3545',
            success: '#198754'
        };

        const logElement = document.createElement('div');
        logElement.style.cssText = `
            margin-bottom: 4px;
            border-bottom: 1px solid #444;
            padding-bottom: 4px;
        `;

        const time = log.timestamp.split('T')[1].split('.')[0];

        logElement.innerHTML = `
            <div style="color: ${colors[log.level] || '#6c757d'}">
                <span style="color: #adb5bd">[${time}]</span>
                <span style="color: ${colors[log.level] || '#6c757d'}">[${log.level.toUpperCase()}]</span>
                ${log.message}
            </div>
        `;

        // If there are data, show them
        if (log.data) {
            const dataElement = document.createElement('div');
            dataElement.style.cssText = `
                margin-left: 20px;
                color: #adb5bd;
                white-space: pre-wrap;
                font-size: 11px;
                overflow: hidden;
                max-height: 80px;
                transition: max-height 0.3s;
                cursor: pointer;
            `;

            let dataStr = '';

            try {
                if (typeof log.data === 'object') {
                    dataStr = JSON.stringify(log.data, null, 2);
                } else {
                    dataStr = String(log.data);
                }
            } catch (e) {
                dataStr = 'Error converting data to text';
            }

            dataElement.textContent = dataStr;

            // Toggle to expand/collapse
            dataElement.addEventListener('click', function() {
                if (this.style.maxHeight === '80px') {
                    this.style.maxHeight = '1000px';
                } else {
                    this.style.maxHeight = '80px';
                }
            });

            logElement.appendChild(dataElement);
        }

        container.appendChild(logElement);
    },

    // Export logs to JSON
    exportLogs: function() {
        const blob = new Blob([JSON.stringify(this.logs, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-debug-logs-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
        a.click();

        URL.revokeObjectURL(url);
    },

    // Get logging style based on level
    getLogStyle: function(level) {
        const styles = {
            debug: 'color: #6c757d',
            info: 'color: #0d6efd',
            warning: 'color: #ffc107',
            error: 'color: #dc3545',
            success: 'color: #198754'
        };
        return styles[level] || 'color: #6c757d';
    },

    // Save log to localStorage
    saveLogToStorage: function(logEntry) {
        const storedLogs = JSON.parse(localStorage.getItem('theme_debug_logs') || '[]');
        storedLogs.push(logEntry);

        // Limit log entries in storage
        if (storedLogs.length > this.maxLogEntries) {
            storedLogs.splice(0, storedLogs.length - this.maxLogEntries);
        }

        localStorage.setItem('theme_debug_logs', JSON.stringify(storedLogs));
    }
};

// Initialize immediately
ThemeDebugger.init();

// Expose globally for use from console
window.ThemeDebugger = ThemeDebugger;