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
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}