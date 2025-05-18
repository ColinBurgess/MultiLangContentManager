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

/**
 * Genera datos de ejemplo para el localStorage si no existen
 */
function generateSampleDataIfNeeded() {
    const existingData = localStorage.getItem('contentData');

    // Verificar si ya existen datos
    if (existingData) {
        const parsedData = JSON.parse(existingData);

        // Si hay datos, no hacer nada
        if (parsedData && parsedData.length > 0) {
            console.log(`Datos existentes encontrados: ${parsedData.length} elementos`);
            return;
        }
    }

    console.log('Generando datos de ejemplo para demostración...');

    const contentData = [];
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // Inicio del año anterior

    // Generar contenido aleatorio para el último año
    for (let i = 0; i < 150; i++) {
        // Fecha aleatoria entre startDate y currentDate
        const randomDays = Math.floor(Math.random() * ((currentDate - startDate) / (1000 * 60 * 60 * 24)));
        const createdAt = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000);

        // Estado de publicación aleatorio
        const publishedEs = Math.random() > 0.3;
        const publishedEn = Math.random() > 0.6;

        // Fecha de publicación (si está publicado)
        let publishedDate = null;
        if (publishedEs || publishedEn) {
            // Fecha de publicación aleatoria después de la fecha de creación
            const daysAfterCreation = Math.floor(Math.random() * 14) + 1; // 1-14 días después
            publishedDate = new Date(createdAt.getTime() + daysAfterCreation * 24 * 60 * 60 * 1000);
        }

        // Plataformas posibles
        const platforms = ['YouTube', 'TikTok', 'Facebook', 'Instagram', 'Twitter'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];

        // Etiquetas aleatorias
        const allTags = ['Tutorial', 'Explicación', 'Review', 'Consejos', 'Unboxing', 'Viaje', 'Cocina', 'Tecnología', 'Gaming', 'Música'];
        const numTags = Math.floor(Math.random() * 4) + 1; // 1-4 etiquetas
        const tags = [];

        for (let j = 0; j < numTags; j++) {
            const randomTagIndex = Math.floor(Math.random() * allTags.length);
            if (!tags.includes(allTags[randomTagIndex])) {
                tags.push(allTags[randomTagIndex]);
            }
        }

        // Crear objeto de contenido
        contentData.push({
            id: `content_${i}`,
            title: `Contenido de ejemplo #${i + 1}`,
            description: `Descripción de ejemplo para el contenido #${i + 1}`,
            createdAt: createdAt.toISOString(),
            publishedDate: publishedDate ? publishedDate.toISOString() : null,
            publishedEs: publishedEs,
            publishedEn: publishedEn,
            publishedUrlEs: publishedEs ? `https://example.com/es/video${i}` : "",
            publishedUrlEn: publishedEn ? `https://example.com/en/video${i}` : "",
            platform: platform,
            tags: tags.join(', ')
        });
    }

    // Guardar en localStorage
    localStorage.setItem('contentData', JSON.stringify(contentData));
    console.log(`Se han generado ${contentData.length} elementos de ejemplo`);
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    generateSampleDataIfNeeded();
});