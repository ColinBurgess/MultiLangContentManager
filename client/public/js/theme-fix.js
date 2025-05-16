/**
 * Theme Fix Script
 * Herramienta para detectar y corregir problemas con la aplicación de temas
 */

// Variable para controlar el logging (debe coincidir con theme-loader.js)
const THEME_FIX_LOGGING_ENABLED = false;

// Función de debug (se conectará con ThemeDebugger si está disponible)
function logFix(message, level = 'debug', data = null) {
    // Si el logging está desactivado, no hacer nada
    if (!THEME_FIX_LOGGING_ENABLED) return;

    if (window.ThemeDebugger && window.ThemeDebugger.log) {
        window.ThemeDebugger.log(`[Fix] ${message}`, level, data);
    } else {
        console.log(`[Theme Fix] ${message}`, data || '');
    }
}

// Objeto principal
const ThemeFix = {
    // Verificar problemas comunes con los temas
    checkThemeIssues: function() {
        logFix('Iniciando diagnóstico de temas', 'info');

        // Verificar que document.body existe
        if (!document.body) {
            logFix('document.body aún no disponible, no se puede realizar diagnóstico completo', 'warning');
            return {
                issue: 'body_not_available',
                description: 'El elemento document.body aún no está disponible',
                suggestion: 'Espere a que la página termine de cargarse e intente nuevamente',
                fixable: false
            };
        }

        // 1. Verificar si hay tema guardado en localStorage
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            logFix('No se encontró tema guardado en localStorage', 'warning');
            return {
                issue: 'no_theme_stored',
                description: 'No hay tema guardado en localStorage',
                suggestion: 'Seleccione y guarde un tema en la página de preferencias'
            };
        }

        // 2. Verificar que el tema guardado sea válido
        const validThemes = ['dark', 'blue', 'purple', 'forest'];
        if (!validThemes.includes(savedTheme)) {
            logFix(`Tema guardado "${savedTheme}" no es válido`, 'error');
            return {
                issue: 'invalid_theme',
                description: `El tema "${savedTheme}" no es válido`,
                suggestion: 'Seleccione un tema válido en la página de preferencias'
            };
        }

        // 3. Verificar que el tema esté aplicado en la página actual
        const themeClass = `theme-${savedTheme}`;
        if (!document.body.classList.contains(themeClass)) {
            logFix(`El tema no está aplicado correctamente. Se esperaba: ${themeClass}`, 'error', {
                currentClasses: document.body.className,
                expectedClass: themeClass
            });
            return {
                issue: 'theme_not_applied',
                description: `El tema "${savedTheme}" no está aplicado correctamente`,
                suggestion: 'Puede intentar recargar la página o forzar la aplicación del tema',
                fixable: true
            };
        }

        // 4. Verificar que las variables CSS están definidas
        const styles = window.getComputedStyle(document.body);
        const requiredVars = [
            '--bg-dark-primary',
            '--bg-dark-secondary',
            '--bg-sidebar',
            '--bg-card',
            '--accent-color'
        ];

        const missingVars = [];
        requiredVars.forEach(varName => {
            const varValue = styles.getPropertyValue(varName).trim();
            if (!varValue) {
                missingVars.push(varName);
            }
        });

        if (missingVars.length > 0) {
            logFix('Faltan variables CSS para el tema', 'error', missingVars);
            return {
                issue: 'missing_css_vars',
                description: `Faltan variables CSS necesarias: ${missingVars.join(', ')}`,
                suggestion: 'Las hojas de estilo no se han cargado correctamente',
                missingVars: missingVars
            };
        }

        // 5. Sin problemas detectados
        logFix('No se encontraron problemas con el tema', 'success', {
            theme: savedTheme,
            appliedClass: themeClass
        });
        return {
            issue: 'none',
            description: 'El tema está correctamente configurado y aplicado'
        };
    },

    // Intentar reparar problemas del tema
    fixThemeIssues: function() {
        logFix('Intentando reparar problemas de tema', 'info');

        // Verificar si el body está disponible
        if (!document.body) {
            logFix('document.body no disponible, no se pueden aplicar reparaciones', 'error');
            return {
                fixed: false,
                message: 'No se puede reparar hasta que document.body esté disponible'
            };
        }

        // Verificar si hay problemas
        const diagnosis = this.checkThemeIssues();
        logFix('Diagnóstico de tema:', 'info', diagnosis);

        // Si no hay problemas, no hacer nada
        if (diagnosis.issue === 'none') {
            logFix('No se detectaron problemas para reparar', 'info');
            return {
                fixed: false,
                message: 'No se detectaron problemas para reparar'
            };
        }

        // Si el body no está disponible, no podemos continuar
        if (diagnosis.issue === 'body_not_available') {
            logFix('No se puede reparar sin acceso a document.body', 'error');
            return {
                fixed: false,
                message: 'Espere a que la página termine de cargarse e intente nuevamente'
            };
        }

        // Aplicar diferentes soluciones según el problema
        switch (diagnosis.issue) {
            case 'no_theme_stored':
                // Establecer un tema por defecto
                localStorage.setItem('theme', 'dark');
                logFix('Se estableció "dark" como tema por defecto', 'info');
                break;

            case 'invalid_theme':
                // Corregir el tema a uno válido
                localStorage.setItem('theme', 'dark');
                logFix('Se corrigió el tema inválido a "dark"', 'info');
                break;

            case 'theme_not_applied':
                // Forzar la aplicación del tema
                const savedTheme = localStorage.getItem('theme');
                logFix(`Aplicando tema "${savedTheme}" forzadamente`, 'info');


                document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');
                document.body.classList.add(`theme-${savedTheme}`);
                break;

            case 'missing_css_vars':
                // Intentar recargar las hojas de estilo
                logFix('Intentando recargar las hojas de estilo', 'info');

                const styleLink = document.querySelector('link[href*="styles.css"]');
                if (styleLink) {
                    // Recargar la hoja de estilo
                    const href = styleLink.getAttribute('href');
                    styleLink.setAttribute('href', href + '?reload=' + Date.now());
                    logFix('Hoja de estilo recargada', 'info');
                } else {
                    logFix('No se encontró la hoja de estilo para recargar', 'error');
                }
                break;

            default:
                logFix(`No se pudo reparar el problema: ${diagnosis.issue}`, 'error');
                return {
                    fixed: false,
                    message: `No se pudo reparar el problema: ${diagnosis.issue}`
                };
        }

        // Verificar si se solucionó el problema
        const newDiagnosis = this.checkThemeIssues();
        if (newDiagnosis.issue === 'none') {
            logFix('Problema reparado exitosamente', 'success');
            return {
                fixed: true,
                message: 'Problema reparado exitosamente'
            };
        } else {
            logFix('No se pudo reparar completamente el problema', 'warning', newDiagnosis);
            return {
                fixed: false,
                message: 'Se intentó reparar el problema pero persiste. Puede ser necesario reiniciar la aplicación.'
            };
        }
    },

    // Forzar un tema específico (útil para debugging)
    forceTheme: function(themeName) {
        if (!themeName) {
            logFix('Se debe especificar un nombre de tema para forzar', 'error');
            return false;
        }

        // Verificar que sea un tema válido
        const validThemes = ['dark', 'blue', 'purple', 'forest'];
        if (!validThemes.includes(themeName)) {
            logFix(`El tema "${themeName}" no es válido`, 'error');
            return false;
        }

        // Verificar que document.body exista
        if (!document.body) {
            logFix('document.body no disponible, aplicación de tema aplazada', 'warning');

            // Esperar a que document.body esté disponible
            window.addEventListener('DOMContentLoaded', () => {
                logFix(`Aplicando tema "${themeName}" ahora que document.body está disponible`, 'info');
                this.forceTheme(themeName);
            });

            return false;
        }

        // Guardar y aplicar el tema
        localStorage.setItem('theme', themeName);
        document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');
        document.body.classList.add(`theme-${themeName}`);

        logFix(`Tema "${themeName}" forzado exitosamente`, 'success');
        return true;
    },

    // Mostrar estado actual de temas y variables
    showThemeState: function() {
        // Recopilar información sobre el tema actual
        const savedTheme = localStorage.getItem('theme') || 'ninguno';
        const bodyClasses = document.body.className.split(' ').filter(c => c.trim() !== '');
        const themeClass = bodyClasses.find(c => c.startsWith('theme-'));

        // Variables CSS relevantes
        const styles = window.getComputedStyle(document.body);
        const cssVars = {
            '--bg-dark-primary': styles.getPropertyValue('--bg-dark-primary').trim(),
            '--bg-dark-secondary': styles.getPropertyValue('--bg-dark-secondary').trim(),
            '--bg-sidebar': styles.getPropertyValue('--bg-sidebar').trim(),
            '--bg-card': styles.getPropertyValue('--bg-card').trim(),
            '--accent-color': styles.getPropertyValue('--accent-color').trim()
        };

        // Hojas de estilo cargadas
        const styleSheets = Array.from(document.styleSheets)
            .map(sheet => ({
                href: sheet.href || 'inline',
                disabled: sheet.disabled
            }));

        // Estado general
        const state = {
            savedTheme,
            appliedThemeClass: themeClass || 'ninguno',
            allBodyClasses: bodyClasses,
            cssVariables: cssVars,
            stylesheets: styleSheets,
            localStorage: {
                theme: localStorage.getItem('theme'),
                theme_updated: localStorage.getItem('theme_updated'),
                viewSettings: localStorage.getItem('viewSettings')
            }
        };

        logFix('Estado actual del sistema de temas', 'info', state);
        return state;
    }
};

// Ejecutar diagnóstico inicial
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const diagnosis = ThemeFix.checkThemeIssues();
        if (diagnosis.issue !== 'none') {
            console.warn('[Theme Fix] Se detectaron problemas con el tema:', diagnosis);
            console.info('[Theme Fix] Use ThemeFix.fixThemeIssues() para intentar repararlos');
        }
    }, 1000); // Esperar un segundo para dar tiempo a que se cargue todo
});

// Exponer globalmente
window.ThemeFix = ThemeFix;