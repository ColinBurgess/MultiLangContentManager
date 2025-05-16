/**
 * Theme Debug Logger
 * Sistema para depurar la carga y aplicación de temas en la aplicación
 */

// Configuración del logger
const ThemeDebugger = {
    enabled: false,  // Desactivado por defecto
    logToConsole: false,
    logToUI: false,
    logToStorage: false,
    logToServer: false,  // Nueva opción para enviar logs al servidor
    maxLogEntries: 100,
    logPrefix: '🔍 [Theme Debug]',

    // Contenedor para los logs en memoria
    logs: [],

    // Inicializar
    init: function() {
        if (!this.enabled) return;

        this.log('ThemeDebugger inicializado', 'info');
        this.logBrowserInfo();
        this.logStorageState();

        // Verificar si el document.body existe
        if (document.body) {
            this.logStylesheets();
            this.logCurrentTheme();
            this.logBodyClasses();

            // Monitorear cambios en las clases del body
            this.monitorBodyClassChanges();
        } else {
            this.log('document.body aún no disponible, esperando...', 'warning');

            // Esperar a que document.body esté disponible
            const waitForBody = setInterval(() => {
                if (document.body) {
                    clearInterval(waitForBody);
                    this.log('document.body ahora disponible', 'success');
                    this.logStylesheets();
                    this.logCurrentTheme();
                    this.logBodyClasses();

                    // Monitorear cambios en las clases del body
                    this.monitorBodyClassChanges();
                }
            }, 10); // Revisar cada 10ms
        }

        // Iniciar monitor de cambios en localStorage
        this.initStorageMonitor();

        // Crear UI para debugging si está habilitado
        if (this.logToUI) {
            document.addEventListener('DOMContentLoaded', () => this.createDebugUI());
        }
    },

    // Registrar un nuevo log
    log: function(message, level = 'debug', data = null) {
        if (!this.enabled) return;

        // Crear entrada de log
        const entry = {
            timestamp: new Date().toISOString(),
            message: message,
            level: level,
            data: data
        };

        // Añadir a la lista de logs en memoria
        this.logs.push(entry);
        if (this.logs.length > this.maxLogEntries) {
            this.logs.shift(); // Eliminar el más antiguo si se excede el límite
        }

        // Output a consola si está habilitado
        if (this.logToConsole) {
            const style = this.getLogStyle(level);
            console.log(`${this.logPrefix} %c${level.toUpperCase()}%c ${message}`, style, 'color: inherit', data || '');
        }

        // Enviar al servidor si está habilitado y no es un nivel de debugging básico
        if (this.logToServer && level !== 'debug') {
            this.sendLogToServer(message, level, data);
        }

        // Almacenar en localStorage si está habilitado
        if (this.logToStorage) {
            this.saveLogToStorage(entry);
        }

        // Actualizar UI si está disponible y habilitado
        if (this.logToUI) {
            const debugPanel = document.getElementById('theme-debug-logs');
            if (debugPanel) {
                this.updateDebugUI(entry);
            }
        }
    },

    // Enviar log al servidor
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

            // Enviar log al servidor
            fetch('/api/logs/theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            }).catch(err => {
                console.error('Error enviando log al servidor:', err);
            });
        } catch (error) {
            console.error('Error preparando log para enviar:', error);
        }
    },

    // Obtener información del navegador y entorno
    logBrowserInfo: function() {
        const info = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            url: window.location.href,
            timestamp: new Date().toString(),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
        };

        this.log('Información del navegador', 'info', info);
    },

    // Obtener estado actual de localStorage
    logStorageState: function() {
        const themeData = {
            theme: localStorage.getItem('theme'),
            theme_updated: localStorage.getItem('theme_updated'),
            theme_reload_required: localStorage.getItem('theme_reload_required'),
            viewSettings: localStorage.getItem('viewSettings')
        };

        this.log('Estado actual de localStorage', 'info', themeData);
    },

    // Registrar las hojas de estilo cargadas
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
                    error: "No se puede acceder a esta hoja de estilo (CORS)"
                });
            }
        }

        this.log(`${stylesheets.length} hojas de estilo cargadas`, 'info', stylesheets);
    },

    // Registrar tema actual
    logCurrentTheme: function() {
        const currentTheme = localStorage.getItem('theme') || 'default';
        this.log(`Tema actual: ${currentTheme}`, 'info');
    },

    // Registrar clases CSS del body
    logBodyClasses: function() {
        // Verificar que el body existe
        if (!document.body) {
            this.log('No se puede acceder a document.body para registrar clases', 'error');
            return;
        }

        const classes = document.body.className.split(' ').filter(c => c.trim() !== '');
        this.log(`Clases del body: ${classes.join(', ') || '(ninguna)'}`, 'info', classes);
    },

    // Monitorear cambios en localStorage
    initStorageMonitor: function() {
        window.addEventListener('storage', (event) => {
            if (event.key && (
                event.key.includes('theme') ||
                event.key.includes('view')
            )) {
                this.log(`Cambio en localStorage: ${event.key}`, 'info', {
                    oldValue: event.oldValue,
                    newValue: event.newValue
                });

                // Re-log estado después del cambio
                setTimeout(() => {
                    this.logStorageState();
                    this.logBodyClasses();
                }, 100);
            }
        });
    },

    // Monitorear cambios en las clases del body
    monitorBodyClassChanges: function() {
        // Verificar que el body existe
        if (!document.body) {
            this.log('No se puede monitorear document.body, no disponible', 'error');
            return;
        }

        // Usar MutationObserver para detectar cambios en el atributo class del body
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const classes = document.body.className.split(' ').filter(c => c.trim() !== '');
                    this.log(`⚠️ Clases del body modificadas`, 'warning', classes);
                }
            });
        });

        observer.observe(document.body, { attributes: true });
    },

    // Crear UI para visualizar logs
    createDebugUI: function() {
        // Si ya existe, no crear otro
        if (document.getElementById('theme-debug-panel')) return;

        // Crear elementos
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

        // Header con controles
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

        // Contenedor de logs
        const logContainer = document.createElement('div');
        logContainer.id = 'theme-debug-logs';
        logContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        `;

        // Footer con info
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
            <div>Página: <span id="theme-debug-page">${window.location.pathname}</span></div>
            <div>Tema: <span id="theme-debug-theme">${localStorage.getItem('theme') || 'default'}</span></div>
        `;

        // Ensamblar panel
        debugPanel.appendChild(header);
        debugPanel.appendChild(logContainer);
        debugPanel.appendChild(footer);

        // Añadir a documento
        document.body.appendChild(debugPanel);

        // Añadir botón toggle
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

        // Añadir eventos
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
            this.log('Logs limpiados', 'info');
        });

        document.getElementById('theme-debug-refresh').addEventListener('click', () => {
            this.logStylesheets();
            this.logStorageState();
            this.logBodyClasses();
            this.refreshDebugUI();
        });

        // Mostrar logs iniciales
        this.refreshDebugUI();
    },

    // Refrescar todos los logs en la UI
    refreshDebugUI: function() {
        const container = document.getElementById('theme-debug-logs');
        if (!container) return;

        container.innerHTML = '';

        this.logs.forEach(log => {
            this.appendLogToUI(log, container);
        });

        // Scroll al fondo
        container.scrollTop = container.scrollHeight;

        // Actualizar info del footer
        document.getElementById('theme-debug-theme').textContent = localStorage.getItem('theme') || 'default';
    },

    // Añadir un log específico a la UI
    updateDebugUI: function(logEntry) {
        const container = document.getElementById('theme-debug-logs');
        if (!container) return;

        this.appendLogToUI(logEntry, container);

        // Scroll al fondo
        container.scrollTop = container.scrollHeight;
    },

    // Método para añadir un log a la UI
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

        // Si hay datos, mostrarlos
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
                dataStr = 'Error al convertir datos a texto';
            }

            dataElement.textContent = dataStr;

            // Toggle para expandir/colapsar
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

    // Exportar logs a JSON
    exportLogs: function() {
        const blob = new Blob([JSON.stringify(this.logs, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-debug-logs-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
        a.click();

        URL.revokeObjectURL(url);
    },

    // Obtener estilo de logging basado en el nivel
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

    // Guardar log en localStorage
    saveLogToStorage: function(logEntry) {
        const storedLogs = JSON.parse(localStorage.getItem('theme_debug_logs') || '[]');
        storedLogs.push(logEntry);

        // Limitar cantidad de logs en storage
        if (storedLogs.length > this.maxLogEntries) {
            storedLogs.splice(0, storedLogs.length - this.maxLogEntries);
        }

        localStorage.setItem('theme_debug_logs', JSON.stringify(storedLogs));
    }
};

// Inicializar inmediatamente
ThemeDebugger.init();

// Exponer globalmente para uso desde consola
window.ThemeDebugger = ThemeDebugger;