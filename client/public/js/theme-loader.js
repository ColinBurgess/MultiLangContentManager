// Este script debe cargarse al principio en todas las páginas
// para asegurar la aplicación consistente del tema

// Variable para controlar el logging
const THEME_LOGGING_ENABLED = false;

// Función para enviar logs al servidor
function sendLogToServer(message, level = 'debug', data = null) {
    // Si el logging está desactivado, no hacer nada
    if (!THEME_LOGGING_ENABLED) return;

    try {
        const logEntry = {
            message,
            level,
            data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            pageTitle: document.title,
            url: window.location.href,
            theme: localStorage.getItem('theme') || 'default'
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

// Función de debugging - se integrará con ThemeDebugger si está disponible
function debugLog(message, level = 'debug', data = null) {
    // Si el logging está desactivado, no hacer nada
    if (!THEME_LOGGING_ENABLED) return;

    // Si existe el debugger global, usarlo
    if (window.ThemeDebugger && window.ThemeDebugger.log) {
        window.ThemeDebugger.log(message, level, data);
    }

    // Enviar al servidor si no es un nivel de debugging básico
    if (level !== 'debug') {
        sendLogToServer(message, level, data);
    }

    // Caso contrario, usar console.log simple
    console.log(`[Theme Debug] ${message}`, data || '');
}

// Función para aplicar el tema de forma segura
function applyThemeSafely(themeName) {
    // Asegurarse de que document.body exista
    if (!document.body) {
        debugLog('document.body no disponible todavía, aplazando aplicación del tema', 'warning');

        // Esperar a que el body esté disponible
        window.addEventListener('DOMContentLoaded', () => {
            debugLog('DOMContentLoaded: document.body ahora disponible, aplicando tema', 'info');
            applyThemeSafely(themeName);
        });
        return;
    }

    debugLog(`Aplicando tema '${themeName}' al body`, 'info');

    // Guardar clases actuales para debug
    const previousClasses = document.body.className;

    // Quitar todas las clases de tema del body
    document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');

    // Agregar la clase del tema seleccionado
    document.body.classList.add(`theme-${themeName}`);

    debugLog('Tema aplicado exitosamente', 'success', {
        before: previousClasses,
        after: document.body.className
    });
}

// Verificar si se requiere recargar la página (para sincronizar tema entre páginas)
(function checkReloadRequired() {
    if (localStorage.getItem('theme_reload_required') === 'true') {
        // Eliminar el flag de recarga
        localStorage.removeItem('theme_reload_required');

        // No recargar si estamos en la página de temas (ya se ha recargado)
        const isThemesPage = window.location.pathname.includes('/themes.html');

        if (!isThemesPage) {
            debugLog('Recargando página para sincronizar tema...', 'info');
            // Retrasar ligeramente para asegurar que sea visible en todas las pestañas
            setTimeout(() => {
                window.location.reload();
            }, 100);
            return; // Evitar la ejecución del resto del script hasta la recarga
        }
    }
})();

// Aplicar el tema inmediatamente al cargar
(function() {
    debugLog('Iniciando carga de tema', 'info');

    // Registrar información de la página
    sendLogToServer('Página cargada', 'info', {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer
    });

    // Obtener tema guardado o usar el del sistema
    const savedTheme = localStorage.getItem('theme');
    debugLog(`Tema almacenado en localStorage: ${savedTheme || 'none'}`, 'info');

    // Si no hay tema guardado, intentar detectar preferencia del sistema
    if (!savedTheme) {
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        debugLog(`Sistema prefiere tema oscuro: ${systemPrefersDark}`, 'info');
    }

    // Tema final a aplicar
    const themeToApply = savedTheme || 'dark';
    debugLog(`Aplicando tema: ${themeToApply}`, 'info');

    // Aplicar el tema de forma segura
    applyThemeSafely(themeToApply);

    // También aplicar configuraciones de vista si existen
    try {
        debugLog('Aplicando configuraciones de vista', 'info');
        const defaultSettings = {
            density: 'default',
            fontSize: '100',
            animations: true,
            autoSave: true,
            hideInfoMessages: false
        };

        const viewSettingsJSON = localStorage.getItem('viewSettings');
        debugLog(`viewSettings en localStorage: ${viewSettingsJSON || 'none'}`, 'info');

        const savedSettings = viewSettingsJSON ? JSON.parse(viewSettingsJSON) : defaultSettings;
        debugLog('Configuraciones a aplicar:', 'info', savedSettings);

        // Aplicar configuraciones de forma segura
        applyViewSettingsSafely(savedSettings);
    } catch (e) {
        debugLog('Error al aplicar configuraciones de vista', 'error', e.toString());
        console.error('Error al aplicar configuraciones de vista:', e);
    }
})();

// Función para aplicar configuraciones de vista de forma segura
function applyViewSettingsSafely(settings) {
    if (!settings) {
        debugLog('No se proporcionaron configuraciones para aplicar', 'error');
        return;
    }

    // Aplicar tamaño de fuente (esto no depende del body)
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
    debugLog(`Tamaño de fuente aplicado: ${settings.fontSize}%`, 'info');

    // Si el body no está disponible, esperar al DOMContentLoaded
    if (!document.body) {
        debugLog('document.body no disponible todavía, aplazando aplicación de estilos', 'warning');

        window.addEventListener('DOMContentLoaded', () => {
            debugLog('DOMContentLoaded: document.body ahora disponible, aplicando estilos', 'info');

            // Aplicar densidad de información
            document.body.classList.remove('density-compact', 'density-default', 'density-comfortable');
            document.body.classList.add(`density-${settings.density}`);
            debugLog(`Densidad aplicada: ${settings.density}`, 'info');

            // Aplicar animaciones
            document.body.classList.toggle('no-animations', !settings.animations);
            debugLog(`Animaciones ${settings.animations ? 'activadas' : 'desactivadas'}`, 'info');
        });
        return;
    }

    // Si el body está disponible, aplicar ahora
    // Aplicar densidad de información
    document.body.classList.remove('density-compact', 'density-default', 'density-comfortable');
    document.body.classList.add(`density-${settings.density}`);
    debugLog(`Densidad aplicada: ${settings.density}`, 'info');

    // Aplicar animaciones
    document.body.classList.toggle('no-animations', !settings.animations);
    debugLog(`Animaciones ${settings.animations ? 'activadas' : 'desactivadas'}`, 'info');
}

// Escuchar cambios en localStorage (para sincronizar temas entre pestañas/ventanas)
window.addEventListener('storage', function(event) {
    debugLog(`Evento storage detectado: ${event.key}`, 'info', {
        key: event.key,
        oldValue: event.oldValue,
        newValue: event.newValue
    });

    // Si el tema ha sido actualizado en otra ventana
    if (event.key === 'theme' || event.key === 'theme_updated') {
        const updatedTheme = localStorage.getItem('theme');
        if (updatedTheme) {
            debugLog(`Actualizando tema por evento storage: ${updatedTheme}`, 'info');
            // Actualizar tema en esta ventana de forma segura
            applyThemeSafely(updatedTheme);
        }
    }

    // Si las configuraciones de vista han sido actualizadas (mediante cambio directo o notificación)
    if (event.key === 'viewSettings' || event.key === 'viewSettings_updated') {
        try {
            debugLog('Actualizando configuraciones de vista por evento storage', 'info');

            const defaultSettings = {
                density: 'default',
                fontSize: '100',
                animations: true,
                autoSave: true,
                hideInfoMessages: false
            };

            const viewSettingsJSON = localStorage.getItem('viewSettings');
            const updatedSettings = viewSettingsJSON ? JSON.parse(viewSettingsJSON) : defaultSettings;

            debugLog('Nuevas configuraciones a aplicar:', 'info', updatedSettings);

            // Aplicar configuraciones de forma segura
            applyViewSettingsSafely(updatedSettings);

            // Actualizar estado de mensajes informativos inmediatamente si es posible
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                debugLog(`Actualizando visibilidad de alertas: ${updatedSettings.hideInfoMessages ? 'ocultas' : 'visibles'}`, 'info');

                if (updatedSettings.hideInfoMessages) {
                    document.querySelectorAll('.alert-info').forEach(alert => {
                        alert.style.display = 'none';
                    });
                } else {
                    document.querySelectorAll('.alert-info').forEach(alert => {
                        alert.style.display = 'block';
                    });
                }
            }
        } catch (e) {
            debugLog('Error al aplicar configuraciones de vista actualizadas', 'error', e.toString());
            console.error('Error al aplicar configuraciones de vista actualizadas:', e);
        }
    }
});

// Cuando el DOM esté cargado completamente, aplicar otras configuraciones que requieren acceso a elementos
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM completamente cargado, aplicando configuraciones finales', 'info');

    // Registrar que el DOM está cargado
    sendLogToServer('DOM completamente cargado', 'info');

    // Registrar todas las hojas de estilo cargadas
    const styleSheets = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            styleSheets.push({
                href: sheet.href,
                disabled: sheet.disabled,
                media: sheet.media.mediaText
            });
        } catch (e) {
            styleSheets.push({
                index: i,
                error: 'No se puede acceder a esta hoja de estilo (posible CORS)'
            });
        }
    }
    debugLog(`Hojas de estilo cargadas (${styleSheets.length})`, 'info', styleSheets);

    // Verificar reglas CSS aplicadas al body para temas
    try {
        debugLog('Verificando estilos CSS aplicados al body', 'info');
        const bodyStyles = window.getComputedStyle(document.body);
        const relevantStyles = {
            backgroundColor: bodyStyles.backgroundColor,
            color: bodyStyles.color,
            classes: document.body.className
        };
        debugLog('Estilos computados relevantes:', 'info', relevantStyles);
    } catch (e) {
        debugLog('Error al verificar estilos computados', 'error', e.toString());
    }

    // Ocultar mensajes informativos si es necesario
    try {
        const viewSettingsJSON = localStorage.getItem('viewSettings');
        if (viewSettingsJSON) {
            const savedSettings = JSON.parse(viewSettingsJSON);
            if (savedSettings.hideInfoMessages) {
                debugLog('Ocultando mensajes informativos según configuración', 'info');
                document.querySelectorAll('.alert-info').forEach(alert => {
                    alert.style.display = 'none';
                });
            }
        }
    } catch (e) {
        debugLog('Error al ocultar mensajes informativos', 'error', e.toString());
        console.error('Error al ocultar mensajes informativos:', e);
    }
});