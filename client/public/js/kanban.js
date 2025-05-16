document.addEventListener('DOMContentLoaded', function() {
    // Load task data or initialize if they don't exist
    initKanban();

    // Set up modal buttons
    document.getElementById('addTaskBtn').addEventListener('click', showTaskModal);
    document.getElementById('closeTaskModal').addEventListener('click', closeTaskModal);
    document.getElementById('closeTaskBtn').addEventListener('click', closeTaskModal);
    document.getElementById('taskModalBackdrop').addEventListener('click', closeTaskModal);
    document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
    document.getElementById('deleteTaskBtn').addEventListener('click', deleteTask);
    document.getElementById('reloadBtn').addEventListener('click', function() {
        showToast('Reloading data...');
        reloadKanbanData();
    });

    // Load contents for the task selector
    loadContentOptions();
});

// Initialize kanban data
function initKanban() {
    console.log('Initializing kanban...');

    // Clear any old data from localStorage
    localStorage.removeItem('kanbanTasks');

    // Load data from server
    fetch('/api/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading data from server: ' + response.status);
            }
            return response.json();
        })
        .then(tasks => {
            console.log('Data received from server:', tasks);

            if (tasks && tasks.length > 0) {
                // Only save to localStorage if there's actual data
                localStorage.setItem('kanbanTasks', JSON.stringify(tasks));

                // Render the board with tasks
                renderKanban(tasks);
            } else {
                console.log('No tasks in the database to display in Kanban');
                // Show informative message
                renderEmptyState();
            }

            // Initialize sortable for each column
            initSortable();
        })
        .catch(error => {
            console.error('Error loading data from server:', error);
            showToast('Could not load data from server', 'error');

            // Show empty state
            renderEmptyState();
            initSortable();
        });
}

// Render the Kanban board
function renderKanban(tasks) {
    console.log('Rendering kanban with tasks:', tasks);

    // Clear columns
    document.getElementById('draft-items').innerHTML = '';
    document.getElementById('in-progress-items').innerHTML = '';
    document.getElementById('done-items').innerHTML = '';

    // Counter for each column
    const counts = {
        draft: 0,
        'in-progress': 0,
        done: 0
    };

    // If there are no tasks, show a guide message
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        renderEmptyState();
        return;
    }

    // Sort tasks by creation date (most recent first)
    tasks.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    // Distribute tasks in corresponding columns
    tasks.forEach(task => {
        // Make sure the task has a valid status
        if (!task.status || !counts.hasOwnProperty(task.status)) {
            task.status = 'draft'; // Default state if not valid
        }

        const taskElement = createTaskElement(task);
        const columnId = `${task.status}-items`;
        const column = document.getElementById(columnId);

        if (column) {
            column.appendChild(taskElement);
            counts[task.status]++;
        }
    });

    // Update counters
    Object.keys(counts).forEach(status => {
        const countElement = document.getElementById(`${status}-count`);
        if (countElement) {
            countElement.textContent = counts[status];
        }
    });

    // Persist the updated state
    if (tasks && tasks.length > 0) {
        localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    }
}

// Create a task element for the board
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'kanban-item';
    // Use MongoDB _id if available, otherwise fall back to id
    taskElement.dataset.id = task._id || task.id;

    // Due date format
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const formattedDueDate = dueDate ? dueDate.toLocaleDateString() : '';

    // Creation date
    const createdDate = task.createdAt ? new Date(task.createdAt) : null;
    const formattedCreatedDate = createdDate ? createdDate.toLocaleDateString() : '';

    // Determine icon and status text
    let statusIcon, statusText;
    switch(task.status) {
        case 'draft':
            statusIcon = 'bi-hourglass';
            statusText = 'To Do';
            break;
        case 'in-progress':
            statusIcon = 'bi-arrow-repeat';
            statusText = 'In Progress';
            break;
        case 'done':
            statusIcon = 'bi-check2-all';
            statusText = 'Completed';
            break;
        default:
            statusIcon = 'bi-question-circle';
            statusText = 'Unknown';
    }

    // Make sure tags is always an array
    const tags = Array.isArray(task.tags) ? task.tags : [];

    // Related content information (if exists)
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
                ${tags.map(tag => `<span class="kanban-tag">${tag}</span>`).join('')}
            </div>
            <div class="kanban-status">
                <span class="text-secondary" title="Status">
                    <i class="bi ${statusIcon} me-1"></i>${statusText}
                </span>
                ${formattedDueDate ? `<span class="text-secondary ms-2" title="Due date">
                    <i class="bi bi-calendar-event me-1"></i>${formattedDueDate}
                </span>` : ''}
                ${formattedCreatedDate ? `<span class="text-secondary ms-2" title="Creation date">
                    <i class="bi bi-calendar me-1"></i>${formattedCreatedDate}
                </span>` : ''}
            </div>
        </div>
    `;

    // Add click event for editing
    taskElement.addEventListener('click', function() {
        // Use task._id if available, otherwise fall back to task.id
        editTask(task._id || task.id);
    });

    return taskElement;
}

// Initialize drag and drop functionality
function initSortable() {
    const columns = document.querySelectorAll('.kanban-items');

    columns.forEach(column => {
        // Destroy previous Sortable instances if they existed
        if (column.sortableInstance) {
            column.sortableInstance.destroy();
        }

        // Create new Sortable instance
        column.sortableInstance = new Sortable(column, {
            group: 'kanban',
            animation: 150,
            ghostClass: 'drag-ghost',
            chosenClass: 'dragging',
            dragClass: 'dragging',
            onEnd: updateTaskStatus
        });
    });

    // Change cursor to pointer to indicate interactive cards
    const items = document.querySelectorAll('.kanban-item');
    items.forEach(item => {
        item.style.cursor = 'pointer';
    });

    console.log('Drag and drop enabled for all columns.');
}

// Update task status after dragging
function updateTaskStatus(evt) {
    const taskId = evt.item.dataset.id;
    const newStatus = evt.to.id.replace('-items', '');

    if (!taskId) {
        console.error('Invalid task ID in drag event');
        showToast('Error: Invalid task ID', 'error');
        reloadKanbanData();
        return;
    }

    console.log(`Updating task ${taskId} to status: ${newStatus}`);

    // Disable interaction during update
    document.body.classList.add('updating');

    // Update status on the server
    fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Task status updated:', data);
        showToast(`Task moved to ${getStatusText(newStatus)}`);

        // Update task in localStorage
        const tasks = JSON.parse(localStorage.getItem('kanbanTasks') || '[]');
        // Find task by either id or _id
        const taskIndex = tasks.findIndex(t => t.id === taskId || t._id === taskId);

        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        }

        // Update counters
        updateColumnCounts();
    })
    .catch(error => {
        console.error('Error updating status:', error);
        showToast('Error updating status', 'error');
        // Revert movement visually in case of error
        reloadKanbanData();
    })
    .finally(() => {
        // Enable interaction again
        document.body.classList.remove('updating');
    });
}

// Get descriptive text for status
function getStatusText(status) {
    switch(status) {
        case 'draft': return 'To Do';
        case 'in-progress': return 'In Progress';
        case 'done': return 'Completed';
        default: return 'Unknown';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    // Remove previous toast if exists
    const existingToast = document.getElementById('kanban-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
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

    // Show and hide automatically
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    // Auto destroy after closing
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Update the counters for each column
function updateColumnCounts() {
    const tasks = JSON.parse(localStorage.getItem('kanbanTasks'));
    const counts = {
        draft: 0,
        'in-progress': 0,
        done: 0
    };

    // Count tasks by status
    if (tasks && Array.isArray(tasks)) {
        tasks.forEach(task => {
            if (counts.hasOwnProperty(task.status)) {
                counts[task.status]++;
            }
        });
    }

    // Update counters in DOM
    Object.keys(counts).forEach(status => {
        const countElement = document.getElementById(`${status}-count`);
        if (countElement) {
            countElement.textContent = counts[status];
        }
    });
}

// Truncate text to a maximum length
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Edit an existing task
function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('kanbanTasks'));

    // Asegurarse de buscar tareas por _id o id según sea disponible
    const task = tasks.find(t => t.id === taskId || t._id === taskId);

    if (task) {
        console.log('Editing task:', task);

        // Update modal title
        document.getElementById('taskModalTitle').textContent = 'Edit Task';
        // Use either _id or id
        document.getElementById('taskModal').dataset.taskId = task._id || task.id;

        // Fill the form with task data
        document.getElementById('taskTitle').value = task.title || '';
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status || 'draft';
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskContentId').value = task.contentId || '';
        document.getElementById('taskAssignee').value = task.assignee || '';
        document.getElementById('taskTags').value = Array.isArray(task.tags) ? task.tags.join(', ') : '';

        // Show delete button for existing tasks
        document.getElementById('deleteTaskBtn').style.display = 'block';

        // Show modal
        document.getElementById('taskModalBackdrop').style.display = 'block';
        document.getElementById('taskModal').style.display = 'block';
        document.body.classList.add('modal-open');
    } else {
        console.error('Task not found with ID:', taskId);
        showToast('Error: Task not found', 'error');
    }
}

// Show modal for new task
function showTaskModal() {
    // First check if there are available contents
    fetch('/api/contents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error getting contents');
            }
            return response.json();
        })
        .then(contents => {
            if (!contents || contents.length === 0) {
                showToast('No contents available to assign to tasks. Create contents first.', 'error');
                return;
            }

            // Reset modal for new task
            document.getElementById('taskModalTitle').textContent = 'New Task';
            document.getElementById('taskModal').dataset.taskId = '';
            document.getElementById('taskForm').reset();
            document.getElementById('taskStatus').value = 'draft';
            document.getElementById('deleteTaskBtn').style.display = 'none';

            // Show modal
            document.getElementById('taskModalBackdrop').style.display = 'block';
            document.getElementById('taskModal').style.display = 'block';
            document.body.classList.add('modal-open');
        })
        .catch(error => {
            console.error('Error checking contents:', error);
            showToast('Error checking available contents', 'error');
        });
}

// Close modal
function closeTaskModal() {
    document.getElementById('taskModalBackdrop').style.display = 'none';
    document.getElementById('taskModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Save a task (new or edited)
function saveTask() {
    // Get form data
    const taskId = document.getElementById('taskModal').dataset.taskId;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const contentId = document.getElementById('taskContentId').value;
    const assignee = document.getElementById('taskAssignee').value;
    const tagsInput = document.getElementById('taskTags').value;
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    // Validate that at least title is present
    if (!title) {
        showToast('Title is required', 'error');
        return;
    }

    if (!contentId) {
        showToast('You must select a content for the task', 'error');
        return;
    }

    // Prepare task data
    const taskData = {
        title,
        description,
        status,
        dueDate,
        contentId,
        tags,
        assignee
    };

    // Create new task or update existing one
    const isNewTask = !taskId;
    const url = isNewTask ? '/api/tasks' : `/api/tasks/${taskId}`;
    const method = isNewTask ? 'POST' : 'PUT';

    // Show loading state
    document.body.classList.add('updating');
    showToast(isNewTask ? 'Creating task...' : 'Updating task...');

    // Make API request
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Task saved:', data);

        // Update local storage and UI
        closeTaskModal();
        showToast(isNewTask ? 'Task created successfully' : 'Task updated successfully');
        reloadKanbanData();
    })
    .catch(error => {
        console.error('Error saving task:', error);
        showToast(`Error: ${error.message}`, 'error');
    })
    .finally(() => {
        document.body.classList.remove('updating');
    });
}

// Load content options for task form
function loadContentOptions() {
    fetch('/api/contents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading contents');
            }
            return response.json();
        })
        .then(contents => {
            if (!contents || !Array.isArray(contents)) {
                return;
            }

            const contentSelect = document.getElementById('taskContentId');

            // Keep the default empty option
            const defaultOption = contentSelect.options[0];
            contentSelect.innerHTML = '';
            contentSelect.appendChild(defaultOption);

            // Add content options
            contents.forEach(content => {
                const option = document.createElement('option');
                // Use MongoDB _id instead of id
                option.value = content._id || content.id;
                option.textContent = content.title || 'Untitled Content';
                contentSelect.appendChild(option);
            });

            console.log('Content options loaded:', contents.length);
        })
        .catch(error => {
            console.error('Error loading contents:', error);
        });
}

// Delete a task
function deleteTask() {
    const taskId = document.getElementById('taskModal').dataset.taskId;

    if (!taskId) {
        closeTaskModal();
        return;
    }

    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        return;
    }

    // Show loading state
    document.body.classList.add('updating');
    showToast('Deleting task...');

    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Task deleted:', data);

        // Update UI
        closeTaskModal();
        showToast('Task deleted successfully');
        reloadKanbanData();
    })
    .catch(error => {
        console.error('Error deleting task:', error);
        showToast('Error deleting task', 'error');
    })
    .finally(() => {
        document.body.classList.remove('updating');
    });
}

// Reload kanban data from server
function reloadKanbanData() {
    document.body.classList.add('updating');

    fetch('/api/tasks')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(tasks => {
            console.log('Data reloaded from server:', tasks);

            // Update localStorage and UI
            if (tasks && Array.isArray(tasks)) {
                localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
                renderKanban(tasks);
            } else {
                renderEmptyState();
            }
        })
        .catch(error => {
            console.error('Error reloading data:', error);
            showToast('Error reloading data', 'error');
        })
        .finally(() => {
            document.body.classList.remove('updating');
        });
}

// Render empty state with guide message
function renderEmptyState() {
    // Clear columns
    document.getElementById('draft-items').innerHTML = '';
    document.getElementById('in-progress-items').innerHTML = '';
    document.getElementById('done-items').innerHTML = '';

    // Reset counters
    document.getElementById('draft-count').textContent = '0';
    document.getElementById('in-progress-count').textContent = '0';
    document.getElementById('done-count').textContent = '0';

    // Add guide message to first column
    const guideElement = document.createElement('div');
    guideElement.className = 'p-3 text-center';
    guideElement.innerHTML = `
        <div class="mb-3">
            <i class="bi bi-info-circle text-info" style="font-size: 2rem;"></i>
        </div>
        <h5>No tasks yet</h5>
        <p>You can create new tasks by clicking on the "New Task" button.</p>
    `;

    document.getElementById('draft-items').appendChild(guideElement);
}
