document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tema y preferencias
    initThemePage();

    // Configurar event listeners
    setupEventListeners();

    // Mostrar el tamaño de fuente actual
    updateFontSizeDisplay();

    // Función para inicializar la aplicación con configuraciones consistentes
    initializeWithTheme();
});

// Variable para controlar el logging (debe coincidir con theme-loader.js)
const THEMES_LOGGING_ENABLED = false;

// Inicializar el tema basado en las preferencias guardadas
function initThemePage() {
    // Cargar preferencias
    loadThemePreferences();

    // Marcar la opción correspondiente como activa
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

    // Cargar la configuración de vista (solo para inicializar los controles)
    loadThemeControlValues();
}

// Configurar listeners para los eventos de la página
function setupEventListeners() {
    // Event listeners para las opciones de tema
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const selectedTheme = this.dataset.theme;

            // Loggear cambio de tema
            sendLogToServer(`Tema cambiado a "${selectedTheme}"`, 'info', {
                previousTheme: localStorage.getItem('theme') || 'default',
                newTheme: selectedTheme,
                userAction: true
            });

            // Marcar opción seleccionada
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');

            // Seleccionar radio button
            const radioInput = this.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;

            // Guardar tema en localStorage
            localStorage.setItem('theme', selectedTheme);

            // Notificar a otras pestañas sobre el cambio de tema
            localStorage.setItem('theme_updated', Date.now().toString());

            // Aplicar al body para vista previa instantánea
            document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');
            document.body.classList.add(`theme-${selectedTheme}`);
        });
    });

    // Event listener para el botón de guardar tema
    document.getElementById('saveThemeBtn').addEventListener('click', function() {
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value;

        // Guardar el tema en localStorage
        localStorage.setItem('theme', selectedTheme);

        // Aplicar el tema a esta página inmediatamente
        applyTheme(selectedTheme);

        // Enviar mensaje a otras ventanas abiertas para actualizar el tema
        localStorage.setItem('theme_updated', Date.now().toString());

        // Verificar si el usuario quiere recargar todas las páginas
        const reloadPages = document.getElementById('reloadPagesCheck')?.checked;

        if (reloadPages) {
            // Mostrar notificación de que se van a recargar las páginas
            showNotification('Actualizando todas las páginas...', 'success');

            // Pequeño retraso antes de recargar para que la notificación sea visible
            setTimeout(() => {
                // Marcar en localStorage que todas las páginas deben recargarse
                localStorage.setItem('theme_reload_required', 'true');

                // Recargar esta página
                window.location.reload();
            }, 1000);
        } else {
            // Mostrar notificación normal
            showNotification('Preferencias de tema guardadas', 'success');
        }

        // Loggear guardado de configuraciones
        sendLogToServer('Configuraciones de tema guardadas', 'info', {
            theme: selectedTheme,
            userAction: true
        });
    });

    // Event listener para el tamaño de fuente
    const fontSizeRange = document.getElementById('fontSizeRange');
    if (fontSizeRange) {
        fontSizeRange.addEventListener('input', function() {
            updateFontSizeDisplay();
        });
    }

    // Event listener para guardar configuración de vista
    document.getElementById('saveViewSettingsBtn').addEventListener('click', function() {
        saveViewSettings();
        showNotification('Configuración de vista guardada', 'success');
    });
}

// Aplicar el tema seleccionado
function applyTheme(theme) {
    // Quitar todas las clases de tema del body
    document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');

    // Agregar la clase del tema seleccionado
    document.body.classList.add(`theme-${theme}`);
}

// Guardar configuración de vista
function saveViewSettings() {
    // Densidad
    const density = document.querySelector('input[name="density"]:checked').value;

    // Tamaño de fuente
    const fontSize = document.getElementById('fontSizeRange').value;

    // Preferencias adicionales
    const animations = document.getElementById('animationsSwitch').checked;
    const autoSave = document.getElementById('autoSaveSwitch').checked;
    const hideInfoMessages = document.getElementById('hideInfoMessagesSwitch').checked;

    // Guardar en localStorage
    const viewSettings = {
        density,
        fontSize,
        animations,
        autoSave,
        hideInfoMessages
    };

    localStorage.setItem('viewSettings', JSON.stringify(viewSettings));

    // Aplicar cambios inmediatamente
    if (typeof applyViewSettings === 'function') {
        // Si existe la función en utils.js, usarla
        applyViewSettings();
    } else {
        // Si no, aplicar aquí los cambios básicos
        applyThemeViewSettings(viewSettings);
    }

    // Notificar a otras ventanas/pestañas sobre el cambio
    localStorage.setItem('viewSettings_updated', Date.now().toString());

    // Loggear guardado de configuraciones
    sendLogToServer('Configuraciones de vista guardadas', 'info', viewSettings);
}

// Cargar valores en los controles de configuración de vista
function loadThemeControlValues() {
    // Obtener configuración guardada o usar valores por defecto
    const defaultSettings = {
        density: 'default',
        fontSize: '100',
        animations: true,
        autoSave: true,
        hideInfoMessages: false
    };

    const savedSettings = JSON.parse(localStorage.getItem('viewSettings')) || defaultSettings;

    // Establecer valores en los controles
    document.getElementById(`density${capitalizeFirstLetter(savedSettings.density)}`).checked = true;
    document.getElementById('fontSizeRange').value = savedSettings.fontSize;
    document.getElementById('animationsSwitch').checked = savedSettings.animations;
    document.getElementById('autoSaveSwitch').checked = savedSettings.autoSave;
    document.getElementById('hideInfoMessagesSwitch').checked = savedSettings.hideInfoMessages;
}

// Aplicar configuración de vista
function applyThemeViewSettings(settings) {
    if (!settings) {
        console.error('No se proporcionaron configuraciones de vista');
        return;
    }

    // Aplicar tamaño de fuente
    document.documentElement.style.fontSize = `${settings.fontSize}%`;

    // Aplicar densidad de información
    document.body.classList.remove('density-compact', 'density-default', 'density-comfortable');
    document.body.classList.add(`density-${settings.density}`);

    // Aplicar animaciones
    document.body.classList.toggle('no-animations', !settings.animations);

    // Ocultar mensajes informativos si es necesario
    if (settings.hideInfoMessages) {
        document.querySelectorAll('.alert-info').forEach(alert => {
            alert.style.display = 'none';
        });
    }
}

// Cargar preferencias de tema
function loadThemePreferences() {
    // Esta función se puede expandir para cargar más preferencias relacionadas con el tema
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return { theme: savedTheme };
}

// Actualizar el display del tamaño de fuente
function updateFontSizeDisplay() {
    const fontSizeValue = document.getElementById('fontSizeRange').value;
    document.getElementById('fontSizeDisplay').textContent = `${fontSizeValue}%`;
}

// Mostrar notificación
function showNotification(message, type) {
    const notification = document.getElementById('themeNotification');
    notification.textContent = message;
    notification.className = `copy-notification ${type}`;
    notification.style.display = 'block';

    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Función auxiliar para capitalizar la primera letra
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para inicializar la aplicación con configuraciones consistentes
function initializeWithTheme() {
    // Crear un elemento en la interfaz para ofrecer la opción de recargar
    document.addEventListener('DOMContentLoaded', function() {
        const cardBody = document.querySelector('#saveThemeBtn').parentElement;

        if (cardBody) {
            // Verificar si ya existe el checkbox para evitar duplicados
            if (!document.getElementById('reloadPagesCheck')) {
                const reloadOption = document.createElement('div');
                reloadOption.className = 'form-check mt-3';
                reloadOption.innerHTML = `
                    <input class="form-check-input" type="checkbox" id="reloadPagesCheck" checked>
                    <label class="form-check-label" for="reloadPagesCheck">
                        Aplicar a todas las páginas abiertas
                    </label>
                    <div class="form-text">Recomendado para asegurar que el tema se aplique correctamente en todas las páginas.</div>
                `;

                cardBody.appendChild(reloadOption);
            }
        }
    });
}

// Función para enviar logs al servidor (similar a theme-loader.js)
function sendLogToServer(message, level = 'debug', data = null) {
    // Si el logging está desactivado, no hacer nada
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
}