document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para los botones
    document.getElementById('backupAllBtn').addEventListener('click', () => createBackup('full'));
    document.getElementById('backupContentBtn').addEventListener('click', () => createBackup('content'));
    document.getElementById('restoreFile').addEventListener('change', handleFileSelection);
    document.getElementById('restoreBtn').addEventListener('click', restoreBackup);

    // Cargar historial de backups
    loadBackupHistory();
});

// Función para crear un backup
function createBackup(type) {
    try {
        // Obtener las opciones seleccionadas
        const includeTasks = document.getElementById('includeTasksCheck').checked;
        const includePreferences = document.getElementById('includePreferencesCheck').checked;
        const prettyPrint = document.getElementById('prettyPrintCheck').checked;

        // Obtener los datos para el backup
        const backupData = {
            version: '1.0',
            type: type,
            timestamp: new Date().toISOString(),
            data: {}
        };

        // Siempre incluir datos de contenido en cualquier tipo de backup
        const contentData = localStorage.getItem('contentData');
        if (contentData) {
            backupData.data.content = JSON.parse(contentData);
        }

        // Incluir tareas de Kanban si está seleccionado
        if (includeTasks && type === 'full') {
            const kanbanTasks = localStorage.getItem('kanbanTasks');
            if (kanbanTasks) {
                backupData.data.kanban = JSON.parse(kanbanTasks);
            }
        }

        // Incluir preferencias si está seleccionado
        if (includePreferences && type === 'full') {
            // Recopilar todas las cookies y configuraciones
            const preferences = {
                cookies: {},
                settings: {}
            };

            // Obtener cookies
            document.cookie.split(';').forEach(cookie => {
                if (cookie.trim()) {
                    const [name, value] = cookie.trim().split('=');
                    preferences.cookies[name] = value;
                }
            });

            // Guardar otras configuraciones como tema, etc.
            const themePref = localStorage.getItem('theme');
            if (themePref) {
                preferences.settings.theme = themePref;
            }

            backupData.data.preferences = preferences;
        }

        // Generar el JSON para descargar
        const backupJson = prettyPrint
            ? JSON.stringify(backupData, null, 2)
            : JSON.stringify(backupData);

        // Crear objeto Blob para la descarga
        const blob = new Blob([backupJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Crear elemento de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `multilang_backup_${type}_${formatDateForFilename(new Date())}.json`;
        document.body.appendChild(a);
        a.click();

        // Limpiar
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Guardar en el historial de backups
        saveBackupToHistory(backupData, backupJson.length);

        // Mostrar notificación de éxito
        showNotification('Backup creado exitosamente', 'success');

    } catch (error) {
        console.error('Error creating backup:', error);
        showNotification('Error al crear backup', 'error');
    }
}

// Guardar referencia del backup en el historial
function saveBackupToHistory(backupData, size) {
    // Obtener historial existente o crear uno nuevo
    const backupHistory = JSON.parse(localStorage.getItem('backupHistory') || '[]');

    // Preparar el nuevo registro
    const newEntry = {
        timestamp: backupData.timestamp,
        type: backupData.type,
        size: formatFileSize(size),
        contents: generateContentSummary(backupData)
    };

    // Agregar al inicio del historial (más reciente primero)
    backupHistory.unshift(newEntry);

    // Limitar a 10 entradas
    if (backupHistory.length > 10) {
        backupHistory.pop();
    }

    // Guardar de vuelta en localStorage
    localStorage.setItem('backupHistory', JSON.stringify(backupHistory));

    // Actualizar el historial en la interfaz
    loadBackupHistory();
}

// Cargar y mostrar el historial de backups
function loadBackupHistory() {
    const historyList = document.getElementById('backupHistoryList');
    const noBackupsMessage = document.getElementById('noBackupsMessage');

    // Obtener historial de backups
    const backupHistory = JSON.parse(localStorage.getItem('backupHistory') || '[]');

    // Mostrar mensaje si no hay historial
    if (backupHistory.length === 0) {
        historyList.innerHTML = '';
        noBackupsMessage.style.display = 'block';
        return;
    }

    // Ocultar mensaje de "no hay backups"
    noBackupsMessage.style.display = 'none';

    // Generar filas para la tabla
    historyList.innerHTML = backupHistory.map(entry => `
        <tr>
            <td>${formatDate(new Date(entry.timestamp))}</td>
            <td><span class="badge ${entry.type === 'full' ? 'bg-primary' : 'bg-secondary'}">${entry.type === 'full' ? 'Completo' : 'Solo Contenido'}</span></td>
            <td>${entry.size}</td>
            <td>${entry.contents}</td>
            <td>
                <button class="btn btn-sm btn-outline-light" disabled>
                    <i class="bi bi-download"></i> Descargar
                </button>
            </td>
        </tr>
    `).join('');
}

// Habilitar/deshabilitar botón de restauración cuando se selecciona un archivo
function handleFileSelection() {
    const fileInput = document.getElementById('restoreFile');
    const restoreBtn = document.getElementById('restoreBtn');

    restoreBtn.disabled = !fileInput.files || fileInput.files.length === 0;
}

// Restaurar desde un archivo de backup
function restoreBackup() {
    const fileInput = document.getElementById('restoreFile');

    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('No se ha seleccionado ningún archivo', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            // Parsear el contenido del archivo
            const backupData = JSON.parse(event.target.result);

            // Verificar la versión y estructura
            if (!backupData.version || !backupData.data) {
                throw new Error('Formato de archivo inválido');
            }

            // Restaurar datos de contenido
            if (backupData.data.content) {
                localStorage.setItem('contentData', JSON.stringify(backupData.data.content));
            }

            // Restaurar tareas de Kanban
            if (backupData.data.kanban) {
                localStorage.setItem('kanbanTasks', JSON.stringify(backupData.data.kanban));
            }

            // Restaurar preferencias
            if (backupData.data.preferences) {
                // Restaurar configuraciones
                if (backupData.data.preferences.settings) {
                    Object.keys(backupData.data.preferences.settings).forEach(key => {
                        localStorage.setItem(key, backupData.data.preferences.settings[key]);
                    });
                }

                // No restauramos cookies directamente por seguridad
            }

            // Mostrar notificación de éxito
            showNotification('Datos restaurados exitosamente', 'success');

            // Recargar la página para aplicar los cambios
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Error restoring backup:', error);
            showNotification('Error al restaurar el backup: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
}

// Mostrar notificación
function showNotification(message, type) {
    const notification = document.getElementById('backupNotification');
    notification.textContent = message;
    notification.className = `copy-notification ${type}`;
    notification.style.display = 'block';

    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Generar resumen del contenido del backup
function generateContentSummary(backupData) {
    const summary = [];

    if (backupData.data.content) {
        const contentCount = Array.isArray(backupData.data.content) ? backupData.data.content.length : 'N/A';
        summary.push(`${contentCount} contenidos`);
    }

    if (backupData.data.kanban) {
        const tasksCount = Array.isArray(backupData.data.kanban) ? backupData.data.kanban.length : 'N/A';
        summary.push(`${tasksCount} tareas`);
    }

    if (backupData.data.preferences) {
        summary.push('Preferencias');
    }

    return summary.join(', ');
}

// Formatear fecha para nombre de archivo
function formatDateForFilename(date) {
    return date.toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
}

// Formatear fecha para mostrar
function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}