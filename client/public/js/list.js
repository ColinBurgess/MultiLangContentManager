document.addEventListener('DOMContentLoaded', function() {
    // Fetch data from the API
    loadContentData();

    // Set up event listeners
    document.getElementById('searchInput').addEventListener('input', filterContents);
    document.getElementById('closeModalBtn').addEventListener('click', closeContentModal);
    document.getElementById('closeContentModal').addEventListener('click', closeContentModal);
    document.getElementById('contentModalBackdrop').addEventListener('click', closeContentModal);

    // Info alert cookie handler
    const infoAlert = document.getElementById('languageIndicatorInfo');
    const closeInfoAlertBtn = document.getElementById('closeInfoAlert');

    // Check if user already closed the alert
    if (getCookie('hideLanguageInfo') === 'true') {
        infoAlert.classList.add('d-none');
    }

    // Set cookie when alert is closed
    closeInfoAlertBtn.addEventListener('click', function() {
        setCookie('hideLanguageInfo', 'true', 30); // Cookie expira en 30 días
        infoAlert.classList.add('d-none');
    });
});

function loadContentData() {
    // Fetch data from the API
    fetch('/api/contents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store the API data in localStorage for offline access and filtering
            localStorage.setItem('contentData', JSON.stringify(data));
            displayContents(data);
        })
        .catch(error => {
            console.error('Error fetching content data:', error);

            // If API fetch fails, try to load from localStorage as fallback
            const contentData = localStorage.getItem('contentData');

            if (contentData) {
                displayContents(JSON.parse(contentData));
            } else {
                // If no data exists, create sample data
                const sampleContent = [
                    {
                        id: 1,
                        title: "🚀 How to Launch a Successful Product",
                        teleprompterEs: "Texto de teleprompter en español...",
                        teleprompterEn: "Teleprompter text in English...",
                        videoDescriptionEs: "Descripción del video en español...",
                        videoDescriptionEn: "Video description in English...",
                        tagsListEs: "producto, lanzamiento, marketing",
                        tagsListEn: "product, launch, marketing",
                        publishedEs: true,
                        publishedEn: false,
                        publishedUrlEs: "https://example.com/es/video1",
                        publishedUrlEn: "",
                        tags: "product, marketing, startup"
                    },
                    {
                        id: 2,
                        title: "💻 Web Development Tips for Beginners",
                        teleprompterEs: "Consejos de desarrollo web en español...",
                        teleprompterEn: "Web development tips in English...",
                        videoDescriptionEs: "Descripción para principiantes en español...",
                        videoDescriptionEn: "Description for beginners in English...",
                        tagsListEs: "desarrollo web, principiantes, html, css",
                        tagsListEn: "web development, beginners, html, css",
                        publishedEs: true,
                        publishedEn: true,
                        publishedUrlEs: "https://example.com/es/video2",
                        publishedUrlEn: "https://example.com/en/video2",
                        tags: "webdev, coding, html, css"
                    },
                    {
                        id: 3,
                        title: "📱 Mobile App UX Design Essentials",
                        teleprompterEs: "Diseño de UX para aplicaciones móviles en español...",
                        teleprompterEn: "Mobile app UX design in English...",
                        videoDescriptionEs: "Descripción de diseño UX en español...",
                        videoDescriptionEn: "UX design description in English...",
                        tagsListEs: "diseño, ux, app, móvil",
                        tagsListEn: "design, ux, app, mobile",
                        publishedEs: false,
                        publishedEn: true,
                        publishedUrlEs: "",
                        publishedUrlEn: "https://example.com/en/video3",
                        tags: "design, ux, mobile, app"
                    }
                ];

                localStorage.setItem('contentData', JSON.stringify(sampleContent));
                displayContents(sampleContent);
            }
        });
}

function displayContents(contents) {
    const contentList = document.getElementById('contentList');
    contentList.innerHTML = '';

    contents.forEach(content => {
        const row = document.createElement('tr');
        // Hacer que toda la fila sea clickeable
        row.style.cursor = 'pointer';
        row.dataset.id = content._id || content.id;
        row.addEventListener('click', function(e) {
            // Si se hizo clic en un botón, no activar el viewContent
            if (!e.target.closest('button')) {
                viewContent(this.dataset.id);
            }
        });

        // Title column
        const titleCell = document.createElement('td');
        titleCell.innerHTML = `
            <div class="d-flex align-items-center">
                <span>${content.title}</span>
            </div>
        `;

        // Status column
        const statusCell = document.createElement('td');
        statusCell.innerHTML = `
            <div class="d-flex align-items-center">
                ${getLanguageIndicator('ES', content.publishedEs, content.publishedUrlEs)}
                ${getLanguageIndicator('EN', content.publishedEn, content.publishedUrlEn)}
            </div>
        `;

        // Tags column
        const tagsCell = document.createElement('td');
        const tagsList = Array.isArray(content.tags) ? content.tags : content.tags.split(',').map(tag => tag.trim());
        const tagsHtml = tagsList.map(tag => `<span class="tag">${tag}</span>`).join('');
        tagsCell.innerHTML = tagsHtml;

        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'text-end';
        actionsCell.innerHTML = `
            <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-outline-light view-btn me-1" data-id="${content._id || content.id}" title="View">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-light edit-btn me-1" data-id="${content._id || content.id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-light delete-btn" data-id="${content._id || content.id}" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        // Add cells to row
        row.appendChild(titleCell);
        row.appendChild(statusCell);
        row.appendChild(tagsCell);
        row.appendChild(actionsCell);

        // Add row to table
        contentList.appendChild(row);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se propague al clic de la fila
            const contentId = this.dataset.id;
            viewContent(contentId);
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se propague al clic de la fila
            const contentId = this.dataset.id;
            editContent(contentId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se propague al clic de la fila
            const contentId = this.dataset.id;
            deleteContent(contentId);
        });
    });
}

function getLanguageIndicator(lang, isPublished, url) {
    const statusClass = isPublished ? 'published' : 'not-published';

    if (isPublished && url) {
        return `<a href="${url}" target="_blank" class="language-indicator ${statusClass}" title="${lang} content is published">
            ${lang}
        </a>`;
    } else {
        return `<span class="language-indicator ${statusClass}" title="${lang} content is not published">
            ${lang}
        </span>`;
    }
}

function filterContents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const contentData = JSON.parse(localStorage.getItem('contentData'));

    if (searchTerm === '') {
        displayContents(contentData);
        return;
    }

    const filteredContents = contentData.filter(content => {
        // Buscar en el título
        if (content.title.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Buscar en las etiquetas
        if (Array.isArray(content.tags)) {
            // Si tags es un array, comprobar cada etiqueta
            return content.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        } else if (typeof content.tags === 'string') {
            // Si tags es una cadena, buscar en ella
            return content.tags.toLowerCase().includes(searchTerm);
        }

        return false;
    });

    displayContents(filteredContents);
}

function viewContent(contentId) {
    // Intenta obtener los datos de localStorage
    const contentData = JSON.parse(localStorage.getItem('contentData'));

    // Busca el contenido por ID (ya sea '_id' de MongoDB o 'id' local)
    const content = contentData.find(item => (item._id === contentId || item.id === contentId));

    if (!content) return;

    // Set modal title
    document.getElementById('contentModalTitle').innerHTML = content.title;

    // Build modal body content
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = '';

    // Teleprompter Section
    const teleprompterSection = document.createElement('div');
    teleprompterSection.className = 'content-field';
    teleprompterSection.innerHTML = `
        <div class="content-field-header">
            <strong>Teleprompter</strong>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEs ? 'published' : 'not-published'}">ES</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.teleprompterEs || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.teleprompterEs || '')}</div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEn ? 'published' : 'not-published'}">EN</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.teleprompterEn || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.teleprompterEn || '')}</div>
            </div>
        </div>
    `;
    modalBody.appendChild(teleprompterSection);

    // Video Description Section
    const videoDescSection = document.createElement('div');
    videoDescSection.className = 'content-field';
    videoDescSection.innerHTML = `
        <div class="content-field-header">
            <strong>Video Description</strong>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEs ? 'published' : 'not-published'}">ES</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.videoDescriptionEs || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.videoDescriptionEs || '')}</div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEn ? 'published' : 'not-published'}">EN</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.videoDescriptionEn || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.videoDescriptionEn || '')}</div>
            </div>
        </div>
    `;
    modalBody.appendChild(videoDescSection);

    // Tags Section
    const tagsSection = document.createElement('div');
    tagsSection.className = 'content-field';
    tagsSection.innerHTML = `
        <div class="content-field-header">
            <strong>Tags</strong>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEs ? 'published' : 'not-published'}">ES</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.tagsListEs || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.tagsListEs || '')}</div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEn ? 'published' : 'not-published'}">EN</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.tagsListEn || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.tagsListEn || '')}</div>
            </div>
        </div>
    `;
    modalBody.appendChild(tagsSection);

    // Pinned Comment Section
    const pinnedCommentSection = document.createElement('div');
    pinnedCommentSection.className = 'content-field';
    pinnedCommentSection.innerHTML = `
        <div class="content-field-header">
            <strong>Pinned Comment</strong>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEs ? 'published' : 'not-published'}">ES</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.pinnedCommentEs || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.pinnedCommentEs || '')}</div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEn ? 'published' : 'not-published'}">EN</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.pinnedCommentEn || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.pinnedCommentEn || '')}</div>
            </div>
        </div>
    `;
    modalBody.appendChild(pinnedCommentSection);

    // TikTok Description Section
    const tiktokDescSection = document.createElement('div');
    tiktokDescSection.className = 'content-field';
    tiktokDescSection.innerHTML = `
        <div class="content-field-header">
            <strong>TikTok Description</strong>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEs ? 'published' : 'not-published'}">ES</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.tiktokDescriptionEs || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.tiktokDescriptionEs || '')}</div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEn ? 'published' : 'not-published'}">EN</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.tiktokDescriptionEn || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.tiktokDescriptionEn || '')}</div>
            </div>
        </div>
    `;
    modalBody.appendChild(tiktokDescSection);

    // Twitter Post Section
    const twitterPostSection = document.createElement('div');
    twitterPostSection.className = 'content-field';
    twitterPostSection.innerHTML = `
        <div class="content-field-header">
            <strong>X (Twitter) Post</strong>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEs ? 'published' : 'not-published'}">ES</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.twitterPostEs || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.twitterPostEs || '')}</div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEn ? 'published' : 'not-published'}">EN</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.twitterPostEn || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.twitterPostEn || '')}</div>
            </div>
        </div>
    `;
    modalBody.appendChild(twitterPostSection);

    // Facebook Description Section
    const facebookDescSection = document.createElement('div');
    facebookDescSection.className = 'content-field';
    facebookDescSection.innerHTML = `
        <div class="content-field-header">
            <strong>Facebook Description</strong>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEs ? 'published' : 'not-published'}">ES</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.facebookDescriptionEs || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.facebookDescriptionEs || '')}</div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="language-indicator ${content.publishedEn ? 'published' : 'not-published'}">EN</span>
                    <button class="copy-btn" data-content="${escapeHtml(content.facebookDescriptionEn || '')}">
                        <i class="bi bi-clipboard"></i> Copy
                    </button>
                </div>
                <div class="content-field-body">${formatContent(content.facebookDescriptionEn || '')}</div>
            </div>
        </div>
    `;
    modalBody.appendChild(facebookDescSection);

    // Set up edit button link
    document.getElementById('editContentBtn').href = `/new-content.html?id=${contentId}`;

    // Add event listeners for copy buttons
    modalBody.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const textToCopy = this.dataset.content;
            copyToClipboard(textToCopy);
        });
    });

    // Show modal
    showContentModal();
}

function editContent(contentId) {
    // Redirect to the edit form page with the content ID
    window.location.href = `/new-content.html?id=${contentId}`;
}

function deleteContent(contentId) {
    if (confirm('Are you sure you want to delete this content?')) {
        // Hacer una petición para borrar el contenido en el servidor
        fetch(`/api/contents/${contentId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            // Eliminar de localStorage y recargar la vista
            const contentData = JSON.parse(localStorage.getItem('contentData'));
            const updatedContentData = contentData.filter(item => (item._id !== contentId && item.id !== contentId));
            localStorage.setItem('contentData', JSON.stringify(updatedContentData));
            displayContents(updatedContentData);
        })
        .catch(error => {
            console.error('Error deleting content:', error);
            alert('Error deleting content. Please try again.');
        });
    }
}

function formatContent(content) {
    if (!content) return '<em class="text-secondary">No content</em>';
    return content.replace(/\n/g, '<br>');
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showContentModal() {
    document.getElementById('contentModalBackdrop').style.display = 'block';
    document.getElementById('contentModal').style.display = 'block';
    document.body.classList.add('modal-open');

    // Set focus on the first button in the modal for accessibility
    setTimeout(() => {
        const firstButton = document.querySelector('.modal-content button');
        if (firstButton) firstButton.focus();
    }, 100);
}

function closeContentModal() {
    document.getElementById('contentModalBackdrop').style.display = 'none';
    document.getElementById('contentModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showCopyNotification('Copied to clipboard!', 'success');
        })
        .catch(err => {
            showCopyNotification('Failed to copy', 'error');
            console.error('Could not copy text: ', err);
        });
}

function showCopyNotification(message, type) {
    // Check if a notification already exists and remove it
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `copy-notification ${type}`;
    notification.innerText = message;

    // Add to document
    document.body.appendChild(notification);

    // Remove after animation completes
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Cookie functions
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

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