document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners
    document.getElementById('showApiKeyBtn').addEventListener('click', toggleApiKeyVisibility);
    document.getElementById('copyApiKeyBtn').addEventListener('click', copyApiKey);
    document.getElementById('regenerateApiKeyBtn').addEventListener('click', regenerateApiKey);
    document.getElementById('copyWebhookBtn').addEventListener('click', copyWebhookUrl);

    // Botones de integración
    document.getElementById('configureAIBtn').addEventListener('click', configureIntegration);
    document.getElementById('connectCMSBtn').addEventListener('click', connectIntegration);
    document.getElementById('configureNotificationsBtn').addEventListener('click', configureIntegration);
    document.getElementById('connectSocialBtn').addEventListener('click', connectIntegration);
    document.getElementById('connectStorageBtn').addEventListener('click', connectIntegration);
    document.getElementById('connectAnalyticsBtn').addEventListener('click', connectIntegration);

    // Inicializar datos ficticios
    initDummyData();
});

// Simular API Key
function initDummyData() {
    // Generar API key si no existe
    if (!localStorage.getItem('apiKey')) {
        localStorage.setItem('apiKey', generateRandomApiKey());
    }

    // Generar URL del webhook
    if (!localStorage.getItem('webhookUrl')) {
        localStorage.setItem('webhookUrl', 'https://api.multilangcontent.com/webhook/' + generateRandomString(6));
    }

    // Establecer URL del webhook en la interfaz
    const webhookDisplay = document.querySelector('.api-key-display:nth-of-type(2)');
    webhookDisplay.textContent = localStorage.getItem('webhookUrl');

    // Agregar botón de copiar de nuevo (porque hemos reemplazado el contenido)
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.id = 'copyWebhookBtn';
    copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
    webhookDisplay.appendChild(copyBtn);

    // Volver a agregar el event listener
    document.getElementById('copyWebhookBtn').addEventListener('click', copyWebhookUrl);
}

// Mostrar/ocultar API Key
function toggleApiKeyVisibility() {
    const apiKeyDisplay = document.querySelector('.api-key-display:first-of-type');
    const eyeIcon = document.getElementById('showApiKeyBtn').querySelector('i');

    if (apiKeyDisplay.textContent.includes('•')) {
        // Mostrar API Key
        apiKeyDisplay.textContent = localStorage.getItem('apiKey');
        eyeIcon.className = 'bi bi-eye-slash';

        // Agregar botón de copiar de nuevo
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.id = 'showApiKeyBtn';
        copyBtn.title = 'Ocultar API Key';
        copyBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
        apiKeyDisplay.appendChild(copyBtn);

        // Volver a agregar el event listener
        document.getElementById('showApiKeyBtn').addEventListener('click', toggleApiKeyVisibility);
    } else {
        // Ocultar API Key
        apiKeyDisplay.textContent = '•••••••••••••••••••••••••••••••••';
        eyeIcon.className = 'bi bi-eye';

        // Agregar botón de mostrar de nuevo
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.id = 'showApiKeyBtn';
        copyBtn.title = 'Mostrar API Key';
        copyBtn.innerHTML = '<i class="bi bi-eye"></i>';
        apiKeyDisplay.appendChild(copyBtn);

        // Volver a agregar el event listener
        document.getElementById('showApiKeyBtn').addEventListener('click', toggleApiKeyVisibility);
    }
}

// Copiar API Key
function copyApiKey() {
    const apiKey = localStorage.getItem('apiKey');

    navigator.clipboard.writeText(apiKey)
        .then(() => {
            showNotification('API Key copiada al portapapeles', 'success');
        })
        .catch(err => {
            console.error('Error al copiar: ', err);
            showNotification('Error al copiar API Key', 'error');
        });
}

// Regenerar API Key
function regenerateApiKey() {
    if (confirm('¿Estás seguro? Regenerar la API Key invalidará todas las integraciones existentes.')) {
        const newApiKey = generateRandomApiKey();
        localStorage.setItem('apiKey', newApiKey);

        // Si la API Key está visible, actualizar el display
        const apiKeyDisplay = document.querySelector('.api-key-display:first-of-type');
        if (!apiKeyDisplay.textContent.includes('•')) {
            apiKeyDisplay.textContent = newApiKey;

            // Agregar botón de copiar de nuevo
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.id = 'showApiKeyBtn';
            copyBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
            apiKeyDisplay.appendChild(copyBtn);

            // Volver a agregar el event listener
            document.getElementById('showApiKeyBtn').addEventListener('click', toggleApiKeyVisibility);
        }

        showNotification('API Key regenerada exitosamente', 'success');
    }
}

// Copiar Webhook URL
function copyWebhookUrl() {
    const webhookUrl = localStorage.getItem('webhookUrl');

    navigator.clipboard.writeText(webhookUrl)
        .then(() => {
            showNotification('Webhook URL copiada al portapapeles', 'success');
        })
        .catch(err => {
            console.error('Error al copiar: ', err);
            showNotification('Error al copiar Webhook URL', 'error');
        });
}

// Configurar una integración existente
function configureIntegration(event) {
    const integrationCard = event.target.closest('.integration-card');
    const integrationTitle = integrationCard.querySelector('h5').textContent;

    showNotification(`Configurando: ${integrationTitle}`, 'info');

    // Aquí iría la lógica para abrir un modal de configuración
    // Por ahora solo simulamos que se está configurando
    setTimeout(() => {
        showNotification(`${integrationTitle} configurado exitosamente`, 'success');
    }, 1500);
}

// Conectar una nueva integración
function connectIntegration(event) {
    const integrationCard = event.target.closest('.integration-card');
    const integrationTitle = integrationCard.querySelector('h5').textContent;
    const statusIndicator = integrationCard.querySelector('.integration-status');
    const statusIcon = statusIndicator.querySelector('i');
    const connectBtn = event.target;

    showNotification(`Conectando con: ${integrationTitle}`, 'info');

    // Simulamos un proceso de conexión
    connectBtn.disabled = true;
    connectBtn.innerHTML = '<i class="bi bi-arrow-repeat spin me-2"></i> Conectando...';

    setTimeout(() => {
        // Cambiar estado a conectado
        statusIndicator.classList.remove('status-disconnected');
        statusIndicator.classList.add('status-connected');
        statusIcon.className = 'bi bi-check-circle-fill';

        // Cambiar botón
        connectBtn.innerHTML = 'Configurar';
        connectBtn.classList.remove('btn-primary');
        connectBtn.classList.add('btn-outline-light');
        connectBtn.disabled = false;

        // Cambiar el event listener
        connectBtn.removeEventListener('click', connectIntegration);
        connectBtn.addEventListener('click', configureIntegration);

        showNotification(`${integrationTitle} conectado exitosamente`, 'success');
    }, 2000);
}

// Generar una API Key aleatoria
function generateRandomApiKey() {
    return generateRandomString(8) + '-' +
           generateRandomString(4) + '-' +
           generateRandomString(4) + '-' +
           generateRandomString(12);
}

// Generar una cadena aleatoria de longitud determinada
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

// Mostrar notificación
function showNotification(message, type) {
    const notification = document.getElementById('integrationNotification');
    notification.textContent = message;
    notification.className = `copy-notification ${type}`;
    notification.style.display = 'block';

    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}