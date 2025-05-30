// Function to update language indicators based on status
function updateLanguageIndicator(language) {
    const statusSelect = document.getElementById(`status${language}`);
    const status = statusSelect.value;
    const indicators = document.querySelectorAll(`.language-indicator`);
    
    console.log(`Actualizando indicador visual para ${language}: ${status}`);
    
    // Actualizar solo los indicadores visuales
    indicators.forEach(indicator => {
        if (indicator.textContent === language.toUpperCase()) {
            indicator.classList.remove('not-published', 'in-progress', 'published', 'pending');
            if (status === 'in-progress') {
                indicator.classList.add('in-progress');
            } else if (status === 'published') {
                indicator.classList.add('published');
            } else {
                indicator.classList.add('pending');
            }
        }
    });
    
    // NO enviar actualización automática al cambiar el selector
    // La actualización del estado se realizará cuando el usuario haga clic en el botón "Guardar"
}

// Función para actualizar el estado en el servidor
function updateContentStatus(contentId, content) {
    return fetch(`/api/contents/${contentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error al actualizar: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Verificar si se realizaron los cambios
        const afterUpdate = JSON.stringify({
            statusEs: data.statusEs,
            statusEn: data.statusEn, 
            publishedEs: data.publishedEs,
            publishedEn: data.publishedEn
        });
        
        // Mostrar notificación de éxito
        showUpdateSuccess('Es', data.statusEs);
        showUpdateSuccess('En', data.statusEn);
        
        return data;
    })
    .catch(error => {
        console.error('Error al actualizar estado:', error);
        // Mostrar mensaje de error en la interfaz sin recargar
        showUpdateError('Status', error.message);
        throw error;
    });
}

// Función para mostrar notificación de éxito
function showUpdateSuccess(language, status) {
    // Encontrar el select que se usó
    const selectElement = document.getElementById(`status${language}`);
    if (!selectElement) return;
    
    // Crear un elemento para mostrar la notificación
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <button type="button" class="btn-close float-end" data-bs-dismiss="alert"></button>
        <i class="bi bi-check-circle-fill"></i> 
        Estado actualizado: ${language === 'Es' ? 'Español' : 'Inglés'} → ${getStatusText(status)}
    `;
    
    // Añadir al cuerpo del documento
    document.body.appendChild(notification);
    
    // Auto cerrar después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
    
    // Destacar el select brevemente
    selectElement.classList.add('border-success');
    setTimeout(() => {
        selectElement.classList.remove('border-success');
    }, 2000);
}

// Función para mostrar error
function showUpdateError(language, errorMessage) {
    // Encontrar el select que se usó
    const selectElement = document.getElementById(`status${language}`);
    if (!selectElement) return;
    
    // Crear un elemento para mostrar la notificación
    const notification = document.createElement('div');
    notification.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <button type="button" class="btn-close float-end" data-bs-dismiss="alert"></button>
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Error al actualizar estado: ${errorMessage}
    `;
    
    // Añadir al cuerpo del documento
    document.body.appendChild(notification);
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Destacar el select brevemente con borde rojo
    selectElement.classList.add('border-danger');
    setTimeout(() => {
        selectElement.classList.remove('border-danger');
    }, 2000);
}

// Función para obtener texto descriptivo del estado
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Pendiente';
        case 'in-progress': return 'En Progreso';
        case 'published': return 'Publicado';
        default: return status;
    }
}

// Initialize status on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial visual indicators for both languages without sending updates
    const statusSelectEs = document.getElementById('statusEs');
    const statusSelectEn = document.getElementById('statusEn');
    
    if (statusSelectEs && statusSelectEn) {
        // Actualizar solo los indicadores visuales sin enviar datos al servidor
        const updateVisualIndicator = (language) => {
            const statusSelect = document.getElementById(`status${language}`);
            const status = statusSelect.value;
            const indicators = document.querySelectorAll(`.language-indicator`);
            
            indicators.forEach(indicator => {
                if (indicator.textContent === language.toUpperCase()) {
                    indicator.classList.remove('not-published', 'in-progress', 'published', 'pending');
                    if (status === 'in-progress') {
                        indicator.classList.add('in-progress');
                    } else if (status === 'published') {
                        indicator.classList.add('published');
                    } else {
                        indicator.classList.add('pending');
                    }
                }
            });
        };
        
        // Actualizar inicialmente los indicadores visuales
        updateVisualIndicator('Es');
        updateVisualIndicator('En');
    }
    
    // Agregar listener al botón de guardar
    const submitButton = document.querySelector('button[type="submit"]');
    const form = document.getElementById('contentForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // El manejador principal del formulario se encargará de la lógica de guardado
            // Solo aseguramos que los estados se actualicen correctamente
            
            // No hacemos nada especial aquí, ya que el handler del formulario 
            // en form.js se encargará de recopilar todos los datos incluyendo los estados
        });
    }
});

// Exportar función para uso en form.js
window.updateContentStatus = updateContentStatus; 