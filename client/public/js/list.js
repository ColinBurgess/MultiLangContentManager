document.addEventListener('DOMContentLoaded', () => {
    const contentList = document.getElementById('contentList');
    const searchInput = document.getElementById('searchInput');
    const contentModal = new bootstrap.Modal(document.getElementById('contentModal'));
    const infoAlert = document.getElementById('languageIndicatorInfo');
    const closeInfoAlert = document.getElementById('closeInfoAlert');

    // Check if user has already closed the informative message
    function checkInfoAlertPreference() {
        if (getCookie('hideLanguageIndicatorInfo') === 'true') {
            if (infoAlert) {
                infoAlert.classList.add('d-none');
            }
        }
    }

    // Handle closing of informative message
    if (closeInfoAlert) {
        closeInfoAlert.addEventListener('click', () => {
            setCookie('hideLanguageIndicatorInfo', 'true', 365); // Cookie valid for 1 year
        });
    }

    // Check preference when loading the page
    checkInfoAlertPreference();

    // Load contents
    async function loadContents() {
        try {
            const response = await fetch('/api/contents');
            const contents = await response.json();
            displayContents(contents);
        } catch (error) {
            console.error('Error loading contents:', error);
            alert('Error loading contents');
        }
    }

    // Display contents
    function displayContents(contents) {
        contentList.innerHTML = '';
        contents.forEach(content => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div class="content-preview-container" onclick="showContent('${content._id}')" style="cursor: pointer; flex-grow: 1;">
                        <h5 class="mb-1">${content.title}</h5>
                    </div>
                    <div class="action-buttons d-flex align-items-center" style="margin-left: 1rem;">
                        <div class="language-status me-3">
                            ${content.publishedEs ?
                                `<a href="${content.publishedUrlEs || '#'}"
                                    class="btn btn-sm language-indicator btn-success"
                                    title="Published in Spanish${!content.publishedUrlEs ? ' (no URL)' : ''}"
                                    target="_blank"
                                    onclick="event.stopPropagation(); ${!content.publishedUrlEs ? 'alert(\'No URL associated with Spanish version\'); return false;' : ''}">
                                    <i class="bi bi-globe"></i> ES
                                </a>` :
                                `<span class="btn btn-sm language-indicator btn-warning"
                                    title="Pending in Spanish">
                                    <i class="bi bi-globe"></i> ES
                                </span>`
                            }
                            ${content.publishedEn ?
                                `<a href="${content.publishedUrlEn || '#'}"
                                    class="btn btn-sm language-indicator btn-success"
                                    title="Published in English${!content.publishedUrlEn ? ' (no URL)' : ''}"
                                    target="_blank"
                                    onclick="event.stopPropagation(); ${!content.publishedUrlEn ? 'alert(\'No URL associated with English version\'); return false;' : ''}">
                                    <i class="bi bi-globe"></i> EN
                                </a>` :
                                `<span class="btn btn-sm language-indicator btn-warning"
                                    title="Pending in English">
                                    <i class="bi bi-globe"></i> EN
                                </span>`
                            }
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteContent('${content._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            contentList.appendChild(item);
        });
    }

    // Show content details
    window.showContent = async (id) => {
        try {
            const response = await fetch(`/api/contents/${id}`);
            const content = await response.json();

            const modalTitle = document.querySelector('#contentModal .modal-title');
            const modalBody = document.querySelector('#contentModal .modal-body');
            const editBtn = document.getElementById('editContentBtn');

            // Helper function to safely encode text for HTML
            const encodeForHtml = (str) => {
                return str.replace(/&/g, '&amp;')
                         .replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;')
                         .replace(/"/g, '&quot;')
                         .replace(/'/g, '&#039;');
            };

            // Helper function to prepare text for onclick attribute
            const prepareForOnClick = (str) => {
                if (!str) return '';
                return str.replace(/\\/g, '\\\\')
                         .replace(/'/g, "\\'")
                         .replace(/"/g, '\\"')
                         .replace(/\n/g, '\\n')
                         .replace(/\r/g, '\\r')
                         .replace(/\t/g, '\\t');
            };

            modalTitle.textContent = content.title;
            modalBody.innerHTML = `
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Video Title:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.title || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <p class="mb-0">${encodeForHtml(content.title || '')}</p>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">Teleprompter</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Spanish:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.teleprompterEs || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.teleprompterEs || '')}</pre>
                    </div>
                </div>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>English:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.teleprompterEn || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.teleprompterEn || '')}</pre>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">Video Description</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Spanish:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.videoDescriptionEs || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.videoDescriptionEs || '')}</pre>
                    </div>
                </div>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>English:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.videoDescriptionEn || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.videoDescriptionEn || '')}</pre>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">Tags List</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Spanish:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.tagsListEs || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.tagsListEs || '')}</pre>
                    </div>
                </div>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>English:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.tagsListEn || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.tagsListEn || '')}</pre>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">Pinned Comment</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Spanish:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.pinnedCommentEs || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.pinnedCommentEs || '')}</pre>
                    </div>
                </div>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>English:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.pinnedCommentEn || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.pinnedCommentEn || '')}</pre>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">TikTok Description</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Spanish:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.tiktokDescriptionEs || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.tiktokDescriptionEs || '')}</pre>
                    </div>
                </div>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>English:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.tiktokDescriptionEn || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.tiktokDescriptionEn || '')}</pre>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">X (Twitter) Post</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Spanish:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.twitterPostEs || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.twitterPostEs || '')}</pre>
                    </div>
                </div>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>English:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.twitterPostEn || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.twitterPostEn || '')}</pre>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">Facebook Description</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Spanish:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.facebookDescriptionEs || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.facebookDescriptionEs || '')}</pre>
                    </div>
                </div>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>English:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.facebookDescriptionEn || '')}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <pre>${encodeForHtml(content.facebookDescriptionEn || '')}</pre>
                    </div>
                </div>

                <h6 class="mt-4 mb-3 border-bottom pb-2">Tags for Categorization</h6>
                <div class="content-field">
                    <div class="content-field-header">
                        <h6>Tags:</h6>
                        <button class="copy-btn" onclick='copyToClipboard("${prepareForOnClick(content.tags.join(', '))}")'>
                            <i class="bi bi-clipboard"></i> Copy
                        </button>
                    </div>
                    <div class="content-field-body">
                        <div class="tag-list">
                            ${content.tags.map(tag => `<span class="tag">${encodeForHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;

            editBtn.href = `/new-content.html?id=${content._id}`;
            contentModal.show();
        } catch (error) {
            console.error('Error loading content:', error);
            alert('Error loading content');
        }
    };

    // Delete content
    window.deleteContent = async (id) => {
        if (!confirm('Are you sure you want to delete this content?')) {
            return;
        }

        try {
            const response = await fetch(`/api/contents/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadContents();
            } else {
                throw new Error('Error while deleting');
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Error deleting content');
        }
    };

    // Search
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        try {
            const response = await fetch(`/api/contents/search?q=${encodeURIComponent(query)}`);
            const contents = await response.json();
            displayContents(contents);
        } catch (error) {
            console.error('Error during search:', error);
        }
    });

    // Function to change publication status
    // This function is no longer used from the list view
    // Publication status can only be modified from the edit view
    window.togglePublishStatus = async (id, language) => {
        console.log('This function is disabled in list view. Use the edit view to change publication status.');
        /* Original code commented out
        try {
            const content = await fetch(`/api/contents/${id}`).then(r => r.json());
            const field = `published${language}`;
            const update = {
                [field]: !content[field]
            };

            const response = await fetch(`/api/contents/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(update)
            });

            if (response.ok) {
                loadContents(); // Reload the list to show the change
            } else {
                throw new Error('Error updating status');
            }
        } catch (error) {
            console.error('Error changing publication status:', error);
            alert('Error updating publication status');
        }
        */
    };

    // Load initial contents
    loadContents();
});