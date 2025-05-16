// Utility function to copy text to clipboard
async function copyToClipboard(text) {
    try {
        // Decodificar el texto antes de copiarlo
        const decodedText = text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

        await navigator.clipboard.writeText(decodedText);
        showCopyNotification(true);
    } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        showCopyNotification(false);
    }
}

// Show a temporary notification when text is copied
function showCopyNotification(success) {
    const notification = document.createElement('div');
    notification.className = `copy-notification ${success ? 'success' : 'error'}`;
    notification.textContent = success ? '¡Copiado!' : 'Error al copiar';
    document.body.appendChild(notification);

    // Remove the notification after a short delay
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Cookie utility functions
function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
}

function setCookie(name, value, days) {
    let expires = '';

    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }

    document.cookie = name + '=' + value + expires + '; path=/';
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// Formatear fechas
function formatDate(date) {
    if (!date) return '';

    if (typeof date === 'string') {
        date = new Date(date);
    }

    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

function formatDateTime(date) {
    if (!date) return '';

    if (typeof date === 'string') {
        date = new Date(date);
    }

    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Truncar texto
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
}

// Detectar el tema del sistema
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

// Aplicar el tema seleccionado
function applyTheme(theme) {
    // Quitar todas las clases de tema del body
    document.body.classList.remove('theme-dark', 'theme-blue', 'theme-purple', 'theme-forest');

    // Agregar la clase del tema seleccionado
    document.body.classList.add(`theme-${theme}`);
}

// Función de utilidad para aplicar configuración de vista
// Esta función está disponible para ser llamada manualmente desde otras páginas cuando sea necesario
function applyViewSettings() {
    // Obtener configuración guardada o usar valores por defecto
    const defaultSettings = {
        density: 'default',
        fontSize: '100',
        animations: true,
        autoSave: true,
        hideInfoMessages: false
    };

    const savedSettings = JSON.parse(localStorage.getItem('viewSettings')) || defaultSettings;

    // Aplicar tamaño de fuente
    document.documentElement.style.fontSize = `${savedSettings.fontSize}%`;

    // Aplicar densidad de información
    document.body.classList.remove('density-compact', 'density-default', 'density-comfortable');
    document.body.classList.add(`density-${savedSettings.density}`);

    // Aplicar animaciones
    document.body.classList.toggle('no-animations', !savedSettings.animations);

    // Ocultar mensajes informativos si es necesario
    if (savedSettings.hideInfoMessages) {
        document.querySelectorAll('.alert-info').forEach(alert => {
            alert.style.display = 'none';
        });
    }
}