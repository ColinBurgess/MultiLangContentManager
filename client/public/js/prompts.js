document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const promptsList = document.getElementById('promptsList');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    // Modal elements - Edit/Create Modal
    const promptModal = document.getElementById('promptModal');
    const promptModalBackdrop = document.getElementById('promptModalBackdrop');
    const promptModalTitle = document.getElementById('promptModalTitle');
    const promptForm = document.getElementById('promptForm');
    const promptId = document.getElementById('promptId');
    const promptTitle = document.getElementById('promptTitle');
    const promptDescription = document.getElementById('promptDescription');
    const promptBody = document.getElementById('promptBody');
    const promptTags = document.getElementById('promptTags');
    const closePromptModal = document.getElementById('closePromptModal');
    const cancelPromptBtn = document.getElementById('cancelPromptBtn');
    const savePromptBtn = document.getElementById('savePromptBtn');
    const newPromptBtn = document.getElementById('newPromptBtn');

    // Modal elements - View Modal
    const viewPromptModal = document.getElementById('viewPromptModal');
    const viewPromptModalBackdrop = document.getElementById('viewPromptModalBackdrop');
    const viewPromptModalTitle = document.getElementById('viewPromptModalTitle');
    const viewPromptDescription = document.getElementById('viewPromptDescription');
    const viewPromptBody = document.getElementById('viewPromptBody');
    const viewPromptTags = document.getElementById('viewPromptTags');
    const closeViewPromptModal = document.getElementById('closeViewPromptModal');
    const closeViewModalBtn = document.getElementById('closeViewModalBtn');
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    const editPromptBtn = document.getElementById('editPromptBtn');

    // Modal elements - Delete Modal
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalBackdrop = document.getElementById('deleteModalBackdrop');
    const deletePromptTitle = document.getElementById('deletePromptTitle');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    let currentPromptId = null;
    let currentPromptData = null;
    let prompts = [];

    // Initialize
    loadPrompts();

    // Event Listeners
    searchInput.addEventListener('input', filterPrompts);
    sortSelect.addEventListener('change', sortPrompts);

    newPromptBtn.addEventListener('click', openNewPromptModal);
    closePromptModal.addEventListener('click', closeModal);
    cancelPromptBtn.addEventListener('click', closeModal);
    savePromptBtn.addEventListener('click', savePrompt);

    closeViewPromptModal.addEventListener('click', () => closeViewModal());
    closeViewModalBtn.addEventListener('click', () => closeViewModal());
    copyPromptBtn.addEventListener('click', copyPromptToClipboard);
    editPromptBtn.addEventListener('click', editCurrentPrompt);

    closeDeleteModal.addEventListener('click', closeDeleteConfirmation);
    cancelDeleteBtn.addEventListener('click', closeDeleteConfirmation);
    confirmDeleteBtn.addEventListener('click', deletePrompt);

    // Functions
    function loadPrompts() {
        fetch('/api/prompts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                prompts = data;
                displayPrompts(prompts);
            })
            .catch(error => {
                console.error('Error loading prompts:', error);
                showToast('Error loading prompts. Please try again later.', 'error');
            });
    }

    function displayPrompts(promptsToDisplay) {
        promptsList.innerHTML = '';

        if (promptsToDisplay.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="4" class="text-center py-4">
                    <i class="bi bi-emoji-neutral me-2"></i>No prompts found.
                    <a href="#" class="create-prompt-link">Create your first prompt</a>
                </td>
            `;
            promptsList.appendChild(emptyRow);

            document.querySelector('.create-prompt-link')?.addEventListener('click', (e) => {
                e.preventDefault();
                openNewPromptModal();
            });
            return;
        }

        promptsToDisplay.forEach(prompt => {
            const promptRow = document.createElement('tr');
            promptRow.className = 'prompt-row';
            promptRow.dataset.id = prompt._id;

            // Format dates
            const updatedDate = new Date(prompt.updatedAt);
            const formattedDate = updatedDate.toLocaleDateString() + ' ' +
                                 updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Format tags
            const tagsHtml = prompt.tags && prompt.tags.length > 0
                ? prompt.tags.map(tag => `<span class="tag me-1">${tag}</span>`).join('')
                : '';

            promptRow.innerHTML = `
                <td class="prompt-title">${prompt.title}</td>
                <td>${prompt.description || ''}</td>
                <td>${formattedDate}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary view-prompt-btn" title="View Prompt">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-prompt-btn" title="Delete Prompt">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            promptsList.appendChild(promptRow);

            // Add event listeners
            promptRow.querySelector('.prompt-title').addEventListener('click', () => {
                viewPrompt(prompt._id);
            });

            promptRow.querySelector('.view-prompt-btn').addEventListener('click', () => {
                viewPrompt(prompt._id);
            });

            promptRow.querySelector('.delete-prompt-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openDeleteConfirmation(prompt._id, prompt.title);
            });
        });
    }

    function filterPrompts() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPrompts = prompts.filter(prompt => {
            return prompt.title.toLowerCase().includes(searchTerm) ||
                   (prompt.description && prompt.description.toLowerCase().includes(searchTerm)) ||
                   (prompt.body && prompt.body.toLowerCase().includes(searchTerm)) ||
                   (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        });

        displayPrompts(filteredPrompts);
    }

    function sortPrompts() {
        const sortValue = sortSelect.value;
        const promptsToSort = [...prompts];

        switch (sortValue) {
            case 'newest':
                promptsToSort.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'updated':
                promptsToSort.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'title':
                promptsToSort.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        displayPrompts(promptsToSort);
    }

    function openNewPromptModal() {
        // Reset form
        promptForm.reset();
        promptId.value = '';
        promptModalTitle.textContent = 'New Prompt';

        // Show modal
        promptModal.style.display = 'block';
        promptModalBackdrop.style.display = 'block';

        // Focus on title field
        setTimeout(() => promptTitle.focus(), 100);
    }

    function closeModal() {
        promptModal.style.display = 'none';
        promptModalBackdrop.style.display = 'none';
    }

    function savePrompt() {
        // Validate form
        if (!promptTitle.value.trim() || !promptBody.value.trim()) {
            showToast('Title and prompt body are required', 'error');
            return;
        }

        // Prepare data
        const promptData = {
            title: promptTitle.value.trim(),
            body: promptBody.value.trim(),
            description: promptDescription.value.trim(),
            tags: promptTags.value.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== '')
        };

        // Determine if creating or updating
        const isUpdate = promptId.value.trim() !== '';
        const url = isUpdate ? `/api/prompts/${promptId.value}` : '/api/prompts';
        const method = isUpdate ? 'PUT' : 'POST';

        // Send request
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(promptData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            closeModal();

            // Update prompts list
            if (isUpdate) {
                const index = prompts.findIndex(p => p._id === data._id);
                if (index !== -1) {
                    prompts[index] = data;
                }
                showToast('Prompt updated successfully', 'success');
            } else {
                prompts.unshift(data);
                showToast('Prompt created successfully', 'success');
            }

            // Refresh display
            displayPrompts(prompts);
        })
        .catch(error => {
            console.error('Error saving prompt:', error);
            showToast('Error saving prompt. Please try again.', 'error');
        });
    }

    function viewPrompt(id) {
        fetch(`/api/prompts/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(prompt => {
                currentPromptId = prompt._id;
                currentPromptData = prompt;

                // Populate view modal
                viewPromptModalTitle.textContent = prompt.title;
                viewPromptDescription.textContent = prompt.description || '';
                viewPromptBody.textContent = prompt.body;

                // Display tags
                viewPromptTags.innerHTML = '';
                if (prompt.tags && prompt.tags.length > 0) {
                    prompt.tags.forEach(tag => {
                        const tagSpan = document.createElement('span');
                        tagSpan.className = 'tag me-1';
                        tagSpan.textContent = tag;
                        viewPromptTags.appendChild(tagSpan);
                    });
                } else {
                    viewPromptTags.innerHTML = '<em class="text-muted">No tags</em>';
                }

                // Show modal
                viewPromptModal.style.display = 'block';
                viewPromptModalBackdrop.style.display = 'block';
            })
            .catch(error => {
                console.error('Error loading prompt:', error);
                showToast('Error loading prompt. Please try again.', 'error');
            });
    }

    function closeViewModal() {
        viewPromptModal.style.display = 'none';
        viewPromptModalBackdrop.style.display = 'none';
    }

    function copyPromptToClipboard() {
        if (!currentPromptData) return;

        navigator.clipboard.writeText(currentPromptData.body)
            .then(() => {
                showToast('Prompt copied to clipboard', 'success');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showToast('Failed to copy to clipboard', 'error');
            });
    }

    function editCurrentPrompt() {
        if (!currentPromptData) return;

        // Close view modal
        closeViewModal();

        // Populate edit form
        promptId.value = currentPromptData._id;
        promptTitle.value = currentPromptData.title;
        promptDescription.value = currentPromptData.description || '';
        promptBody.value = currentPromptData.body;
        promptTags.value = currentPromptData.tags ? currentPromptData.tags.join(', ') : '';

        // Set modal title
        promptModalTitle.textContent = 'Edit Prompt';

        // Show edit modal
        promptModal.style.display = 'block';
        promptModalBackdrop.style.display = 'block';
    }

    function openDeleteConfirmation(id, title) {
        currentPromptId = id;
        deletePromptTitle.textContent = title;

        // Show delete modal
        deleteModal.style.display = 'block';
        deleteModalBackdrop.style.display = 'block';
    }

    function closeDeleteConfirmation() {
        deleteModal.style.display = 'none';
        deleteModalBackdrop.style.display = 'none';
    }

    function deletePrompt() {
        if (!currentPromptId) return;

        fetch(`/api/prompts/${currentPromptId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            // Remove from array
            prompts = prompts.filter(p => p._id !== currentPromptId);

            // Close modal
            closeDeleteConfirmation();

            // Refresh display
            displayPrompts(prompts);

            showToast('Prompt deleted successfully', 'success');
        })
        .catch(error => {
            console.error('Error deleting prompt:', error);
            showToast('Error deleting prompt. Please try again.', 'error');
        });
    }

    function showToast(message, type = 'info') {
        // Check if utils.js has a showToast function
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            // Simple fallback
            alert(message);
        }
    }
});