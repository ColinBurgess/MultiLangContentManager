document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos de tareas o inicializar si no existen
    initKanban();

    // Configurar botones del modal
    document.getElementById('addTaskBtn').addEventListener('click', showTaskModal);
    document.getElementById('closeTaskModal').addEventListener('click', closeTaskModal);
    document.getElementById('closeTaskBtn').addEventListener('click', closeTaskModal);
    document.getElementById('taskModalBackdrop').addEventListener('click', closeTaskModal);
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
    document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);
    document.getElementById('reloadBtn').addEventListener('click', function() {
        showToast('Recargando datos...');
        reloadKanbanData();
    });

    // Cargar contenidos para el selector de tareas
    loadContentOptions();
});

// Inicializar datos de kanban
function initKanban() {
    console.log('Inicializando kanban...');

    // Limpiar cualquier dato antiguo del localStorage
    localStorage.removeItem('kanbanTasks');

    // Cargar datos desde el servidor
    fetch('/api/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error cargando datos del servidor: ' + response.status);
            }
            return response.json();
        })
        .then(tasks => {
            console.log('Datos recibidos del servidor:', tasks);

            if (tasks && tasks.length > 0) {
                // Solo guardar en localStorage si hay datos reales
                localStorage.setItem('kanbanTasks', JSON.stringify(tasks));

                // Renderizar el tablero con las tareas
                renderKanban(tasks);
            } else {
                console.log('No hay tareas en la base de datos para mostrar en Kanban');
                // Mostrar mensaje informativo
                renderEmptyState();
            }

            // Inicializar sortable para cada columna
            initSortable();
        })
        .catch(error => {
            console.error('Error al cargar datos del servidor:', error);
            showToast('No se pudieron cargar los datos del servidor', 'error');

            // Mostrar estado vacío
            renderEmptyState();
            initSortable();
        });
}

// Renderizar el tablero Kanban
function renderKanban(tasks) {
    console.log('Renderizando kanban con tareas:', tasks);

    // Limpiar las columnas
    document.getElementById('draft-items').innerHTML = '';
    document.getElementById('in-progress-items').innerHTML = '';
    document.getElementById('done-items').innerHTML = '';

    // Contador para cada columna
    const counts = {
        draft: 0,
        'in-progress': 0,
        done: 0
    };

    // Si no hay tareas, mostrar un mensaje guía
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        renderEmptyState();
        return;
    }

    // Ordenar tareas por fecha de creación (más recientes primero)
    tasks.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    // Distribuir las tareas en las columnas correspondientes
    tasks.forEach(task => {
        // Asegurarse de que la tarea tiene un estado válido
        if (!task.status || !counts.hasOwnProperty(task.status)) {
            task.status = 'draft'; // Estado por defecto si no es válido
        }

        const taskElement = createTaskElement(task);
        const columnId = `${task.status}-items`;
        const column = document.getElementById(columnId);

        if (column) {
            column.appendChild(taskElement);
            counts[task.status]++;
        }
    });

    // Actualizar los contadores
    Object.keys(counts).forEach(status => {
        const countElement = document.getElementById(`${status}-count`);
        if (countElement) {
            countElement.textContent = counts[status];
        }
    });

    // Persistir el estado actualizado
    if (tasks && tasks.length > 0) {
        localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    }
}

// Crear un elemento de tarea para el tablero
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'kanban-item';
    taskElement.dataset.id = task.id;

    // Formato de fecha límite
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const formattedDueDate = dueDate ? dueDate.toLocaleDateString() : '';

    // Fecha de creación
    const createdDate = task.createdAt ? new Date(task.createdAt) : null;
    const formattedCreatedDate = createdDate ? createdDate.toLocaleDateString() : '';

    // Determinar icono y texto de estado
    let statusIcon, statusText;
    switch(task.status) {
        case 'draft':
            statusIcon = 'bi-hourglass';
            statusText = 'Por Hacer';
            break;
        case 'in-progress':
            statusIcon = 'bi-arrow-repeat';
            statusText = 'En Progreso';
            break;
        case 'done':
            statusIcon = 'bi-check2-all';
            statusText = 'Completado';
            break;
        default:
            statusIcon = 'bi-question-circle';
            statusText = 'Desconocido';
    }

    // Información del contenido relacionado (si existe)
    const contentInfo = task.contentTitle ?
        `<div class="content-info text-secondary mb-2">
            <i class="bi bi-link me-1"></i> ${task.contentTitle}
        </div>` : '';

    taskElement.innerHTML = `
        <div class="kanban-item-title">${task.title}</div>
        ${contentInfo}
        <div class="kanban-item-desc text-secondary">${truncateText(task.description, 80)}</div>
        <div class="kanban-item-footer">
            <div>
                ${task.tags.map(tag => `<span class="kanban-tag">${tag}</span>`).join('')}
            </div>
            <div class="kanban-status">
                <span class="text-secondary" title="Estado">
                    <i class="bi ${statusIcon} me-1"></i>${statusText}
                </span>
                ${formattedDueDate ? `<span class="text-secondary ms-2" title="Fecha límite">
                    <i class="bi bi-calendar-event me-1"></i>${formattedDueDate}
                </span>` : ''}
                ${formattedCreatedDate ? `<span class="text-secondary ms-2" title="Fecha de creación">
                    <i class="bi bi-calendar me-1"></i>${formattedCreatedDate}
                </span>` : ''}
            </div>
        </div>
    `;

    // Agregar evento de clic para editar
    taskElement.addEventListener('click', function() {
        editTask(task.id);
    });

    return taskElement;
}

// Inicializar la funcionalidad de arrastrar y soltar
function initSortable() {
    const columns = document.querySelectorAll('.kanban-items');

    columns.forEach(column => {
        // Destruir instancias previas de Sortable si existieran
        if (column.sortableInstance) {
            column.sortableInstance.destroy();
        }

        // Crear nueva instancia de Sortable
        column.sortableInstance = new Sortable(column, {
            group: 'kanban',
            animation: 150,
            ghostClass: 'drag-ghost',
            chosenClass: 'dragging',
            dragClass: 'dragging',
            onEnd: updateTaskStatus
        });
    });

    // Cambiar el cursor a pointer para indicar que las tarjetas son interactivas
    const items = document.querySelectorAll('.kanban-item');
    items.forEach(item => {
        item.style.cursor = 'pointer';
    });

    console.log('Drag and drop habilitado para todas las columnas.');
}

// Actualizar el estado de una tarea después de arrastrarla
function updateTaskStatus(evt) {
    const taskId = evt.item.dataset.id;
    const newStatus = evt.to.id.replace('-items', '');

    console.log(`Actualizando tarea ${taskId} a estado: ${newStatus}`);

    // Deshabilitar interacción durante la actualización
    document.body.classList.add('updating');

    // Actualizar el estado en el servidor
    fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Estado de tarea actualizado:', data);
        showToast(`Tarea movida a ${getStatusText(newStatus)}`);

        // Actualizar la tarea en el localStorage
        const tasks = JSON.parse(localStorage.getItem('kanbanTasks') || '[]');
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        }

        // Actualizar los contadores
        updateColumnCounts();
    })
    .catch(error => {
        console.error('Error al actualizar estado:', error);
        showToast('Error al actualizar el estado', 'error');
        // Revertir el movimiento visualmente en caso de error
        reloadKanbanData();
    })
    .finally(() => {
        // Habilitar interacción nuevamente
        document.body.classList.remove('updating');
    });
}

// Obtener texto descriptivo del estado
function getStatusText(status) {
    switch(status) {
        case 'draft': return 'Por Hacer';
        case 'in-progress': return 'En Progreso';
        case 'done': return 'Completado';
        default: return 'Desconocido';
    }
}

// Mostrar notificación toast
function showToast(message, type = 'success') {
    // Eliminar toast anterior si existe
    const existingToast = document.getElementById('kanban-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Crear nuevo toast
    const toast = document.createElement('div');
    toast.id = 'kanban-toast';
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.zIndex = '1050';

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.body.appendChild(toast);

    // Mostrar y ocultar automáticamente
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    // Auto destruir despues de cerrarse
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Actualizar los contadores de cada columna
function updateColumnCounts() {
    const tasks = JSON.parse(localStorage.getItem('kanbanTasks'));
    const counts = {
        draft: 0,
        'in-progress': 0,
        done: 0
    };

    // Contar las tareas por estado
    if (tasks && Array.isArray(tasks)) {
        tasks.forEach(task => {
            if (counts.hasOwnProperty(task.status)) {
                counts[task.status]++;
            }
        });
    }

    // Actualizar los contadores en el DOM
    Object.keys(counts).forEach(status => {
        const countElement = document.getElementById(`${status}-count`);
        if (countElement) {
            countElement.textContent = counts[status];
        }
    });
}

// Truncar texto a una longitud máxima
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Editar una tarea existente
function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('kanbanTasks'));
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        // Actualizar el título del modal
        document.getElementById('taskModalTitle').textContent = 'Editar Tarea';
        document.getElementById('taskModal').dataset.taskId = taskId;

        // Llenar el formulario con los datos de la tarea
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskContentId').value = task.contentId || '';
        document.getElementById('taskAssignee').value = task.assignee;
        document.getElementById('taskTags').value = task.tags.join(', ');

        // Mostrar el botón de eliminar para tareas existentes
        document.getElementById('deleteTaskBtn').style.display = 'block';

        // Mostrar el modal
        document.getElementById('taskModalBackdrop').style.display = 'block';
        document.getElementById('taskModal').style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

// Mostrar el modal para nueva tarea
function showTaskModal() {
    // Verificar primero si hay contenidos disponibles
    fetch('/api/contents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error obteniendo contenidos');
            }
            return response.json();
        })
        .then(contents => {
            if (!contents || contents.length === 0) {
                showToast('No hay contenidos disponibles para asignar a tareas. Crea contenidos primero.', 'error');
                return;
            }

            // Resetear modal para nueva tarea
            document.getElementById('taskModalTitle').textContent = 'Nueva Tarea';
            document.getElementById('taskModal').dataset.taskId = '';
            document.getElementById('taskForm').reset();
            document.getElementById('taskStatus').value = 'draft';
            document.getElementById('deleteTaskBtn').style.display = 'none';

            // Mostrar el modal
            document.getElementById('taskModalBackdrop').style.display = 'block';
            document.getElementById('taskModal').style.display = 'block';
            document.body.classList.add('modal-open');
        })
        .catch(error => {
            console.error('Error al verificar contenidos:', error);
            showToast('Error al verificar contenidos disponibles', 'error');
        });
}

// Cerrar el modal
function closeTaskModal() {
    document.getElementById('taskModalBackdrop').style.display = 'none';
    document.getElementById('taskModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Guardar una tarea (nueva o editada)
function saveTask() {
    // Obtener los datos del formulario
    const taskId = document.getElementById('taskModal').dataset.taskId;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const contentId = document.getElementById('taskContentId').value;
    const assignee = document.getElementById('taskAssignee').value;
    const tagsInput = document.getElementById('taskTags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    // Validar que al menos el título esté presente
    if (!title) {
        showToast('El título es obligatorio', 'error');
        return;
    }

    if (!contentId) {
        showToast('Debe seleccionar un contenido para la tarea', 'error');
        return;
    }

    // Construir objeto de tarea
    const taskData = {
        title,
        description,
        status,
        dueDate,
        contentId,
        assignee,
        tags
    };

    // Determinar si es actualización o creación
    const method = taskId ? 'PUT' : 'POST';
    const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';

    // Enviar al servidor
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showToast(taskId ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente');

        // Recargar datos para mostrar los cambios
        reloadKanbanData();

        // Cerrar el modal
        closeTaskModal();
    })
    .catch(error => {
        console.error('Error al guardar la tarea:', error);
        showToast('Error al guardar la tarea', 'error');
    });
}

// Cargar opciones de contenidos para el select
function loadContentOptions() {
    fetch('/api/contents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar contenidos');
            }
            return response.json();
        })
        .then(contents => {
            const select = document.getElementById('taskContentId');

            // Limpiar opciones existentes excepto la primera
            while (select.options.length > 1) {
                select.options.remove(1);
            }

            // Agregar nuevas opciones
            contents.forEach(content => {
                const option = document.createElement('option');
                option.value = content._id;
                option.textContent = content.title;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar opciones de contenido:', error);
        });
}

// Eliminar una tarea
function deleteTask() {
    const taskId = document.getElementById('taskModal').dataset.taskId;

    if (!taskId) {
        closeTaskModal();
        return;
    }

    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        return;
    }

    // Eliminar del servidor
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        showToast('Tarea eliminada correctamente');

        // Actualizar en localStorage
        const tasks = JSON.parse(localStorage.getItem('kanbanTasks') || '[]');
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('kanbanTasks', JSON.stringify(updatedTasks));

        // Actualizar UI
        renderKanban(updatedTasks);
        closeTaskModal();
    })
    .catch(error => {
        console.error('Error al eliminar la tarea:', error);
        showToast('Error al eliminar la tarea', 'error');
    });
}

// Función para recargar datos del Kanban desde el servidor
function reloadKanbanData() {
    fetch('/api/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al recargar datos');
            }
            return response.json();
        })
        .then(tasks => {
            console.log('Datos recargados del servidor:', tasks);

            // Actualizar localStorage con los datos más recientes
            localStorage.setItem('kanbanTasks', JSON.stringify(tasks));

            // Renderizar el tablero con las tareas actualizadas
            renderKanban(tasks);

            // Reinicializar sortable
            initSortable();
        })
        .catch(error => {
            console.error('Error al recargar datos:', error);
            showToast('Error al recargar datos', 'error');
        });
}

// Renderizar estado vacío para el Kanban
function renderEmptyState() {
    // Limpiar las columnas
    document.getElementById('draft-items').innerHTML = '';
    document.getElementById('in-progress-items').innerHTML = '';
    document.getElementById('done-items').innerHTML = '';

    // Mostrar mensaje en la primera columna
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'kanban-item';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = 'var(--text-secondary)';
    emptyMessage.innerHTML = `
        <div class="mb-3">
            <i class="bi bi-info-circle" style="font-size: 1.5rem;"></i>
        </div>
        <div>
            <p>No hay tareas para mostrar en el Kanban.</p>
            <p>Puedes crear nuevas tareas haciendo clic en el botón "Nueva Tarea".</p>
        </div>
    `;

    document.getElementById('draft-items').appendChild(emptyMessage);

    // Actualizar los contadores
    document.getElementById('draft-count').textContent = '0';
    document.getElementById('in-progress-count').textContent = '0';
    document.getElementById('done-count').textContent = '0';
}
