document.addEventListener('DOMContentLoaded', function() {
    // Bulk selection state
    let bulkMode = false;
    let selectedItems = new Set();

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

    // Platform configuration modal event listeners
    document.getElementById('platformConfigBtn').addEventListener('click', showPlatformConfigModal);
    document.getElementById('closePlatformConfigModal').addEventListener('click', closePlatformConfigModal);
    document.getElementById('platformConfigModalBackdrop').addEventListener('click', closePlatformConfigModal);
    document.getElementById('resetPlatformConfig').addEventListener('click', resetPlatformConfig);
    document.getElementById('savePlatformConfig').addEventListener('click', closePlatformConfigModal);

    // Bulk operations event listeners
    document.getElementById('bulkModeBtn').addEventListener('click', toggleBulkMode);
    document.getElementById('cancelBulkMode').addEventListener('click', exitBulkMode);
    document.getElementById('applyBulkAction').addEventListener('click', applyBulkAction);
    document.getElementById('selectAll').addEventListener('change', selectAllItems);
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
                        tags: "product, marketing, startup",
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        platformStatus: {
                            youtube: {
                                statusEs: 'published',
                                statusEn: 'in-progress',
                                urlEs: 'https://youtube.com/watch?v=1',
                                urlEn: '',
                                publishedDateEs: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                                publishedDateEn: null
                            },
                            tiktok: {
                                statusEs: 'published',
                                statusEn: 'pending',
                                urlEs: 'https://tiktok.com/@user/video1',
                                urlEn: '',
                                publishedDateEs: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                                publishedDateEn: null
                            },
                            instagram: {
                                statusEs: 'in-progress',
                                statusEn: 'pending',
                                urlEs: '',
                                urlEn: '',
                                publishedDateEs: null,
                                publishedDateEn: null
                            },
                            twitter: {
                                statusEs: 'published',
                                statusEn: 'published',
                                urlEs: 'https://twitter.com/user/status/1',
                                urlEn: 'https://twitter.com/user/status/2',
                                publishedDateEs: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                                publishedDateEn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                            },
                            facebook: {
                                statusEs: 'pending',
                                statusEn: 'pending',
                                urlEs: '',
                                urlEn: '',
                                publishedDateEs: null,
                                publishedDateEn: null
                            }
                        }
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
                        tags: "webdev, coding, html, css",
                        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        platformStatus: {
                            youtube: {
                                statusEs: 'published',
                                statusEn: 'published',
                                urlEs: 'https://youtube.com/watch?v=2es',
                                urlEn: 'https://youtube.com/watch?v=2en',
                                publishedDateEs: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                                publishedDateEn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                            },
                            tiktok: {
                                statusEs: 'published',
                                statusEn: 'in-progress',
                                urlEs: 'https://tiktok.com/@user/video2',
                                urlEn: '',
                                publishedDateEs: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                                publishedDateEn: null
                            },
                            instagram: {
                                statusEs: 'published',
                                statusEn: 'published',
                                urlEs: 'https://instagram.com/p/post2es',
                                urlEn: 'https://instagram.com/p/post2en',
                                publishedDateEs: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                                publishedDateEn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                            },
                            twitter: {
                                statusEs: 'pending',
                                statusEn: 'pending',
                                urlEs: '',
                                urlEn: '',
                                publishedDateEs: null,
                                publishedDateEn: null
                            },
                            facebook: {
                                statusEs: 'in-progress',
                                statusEn: 'in-progress',
                                urlEs: '',
                                urlEn: '',
                                publishedDateEs: null,
                                publishedDateEn: null
                            }
                        }
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
                        tags: "design, ux, mobile, app",
                        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        publishedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        platformStatus: {
                            youtube: {
                                statusEs: 'pending',
                                statusEn: 'published',
                                urlEs: '',
                                urlEn: 'https://youtube.com/watch?v=3en',
                                publishedDateEs: null,
                                publishedDateEn: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
                            },
                            tiktok: {
                                statusEs: 'in-progress',
                                statusEn: 'published',
                                urlEs: '',
                                urlEn: 'https://tiktok.com/@user/video3',
                                publishedDateEs: null,
                                publishedDateEn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            },
                            instagram: {
                                statusEs: 'pending',
                                statusEn: 'in-progress',
                                urlEs: '',
                                urlEn: '',
                                publishedDateEs: null,
                                publishedDateEn: null
                            },
                            twitter: {
                                statusEs: 'published',
                                statusEn: 'published',
                                urlEs: 'https://twitter.com/user/status/3es',
                                urlEn: 'https://twitter.com/user/status/3en',
                                publishedDateEs: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                                publishedDateEn: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
                            },
                            facebook: {
                                statusEs: 'pending',
                                statusEn: 'published',
                                urlEs: '',
                                urlEn: 'https://facebook.com/posts/3',
                                publishedDateEs: null,
                                publishedDateEn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        id: 4,
                        title: "🎬 Video Editing Masterclass",
                        teleprompterEs: "Clase magistral de edición de video en español...",
                        teleprompterEn: "Video editing masterclass in English...",
                        videoDescriptionEs: "Descripción de edición de video en español...",
                        videoDescriptionEn: "Video editing description in English...",
                        tagsListEs: "edición, video, tutorial, masterclass",
                        tagsListEn: "editing, video, tutorial, masterclass",
                        publishedEs: true,
                        publishedEn: true,
                        publishedUrlEs: "https://example.com/es/video4",
                        publishedUrlEn: "https://example.com/en/video4",
                        tags: "editing, video, tutorial",
                        createdAt: new Date().toISOString(), // Hoy
                        publishedDate: new Date().toISOString() // Hoy
                    },
                    {
                        id: 5,
                        title: "💼 Business Growth Strategies",
                        teleprompterEs: "Estrategias de crecimiento empresarial en español...",
                        teleprompterEn: "Business growth strategies in English...",
                        videoDescriptionEs: "Descripción de estrategias en español...",
                        videoDescriptionEn: "Strategies description in English...",
                        tagsListEs: "negocios, crecimiento, estrategias",
                        tagsListEn: "business, growth, strategies",
                        publishedEs: true,
                        publishedEn: false,
                        publishedUrlEs: "https://example.com/es/video5",
                        publishedUrlEn: "",
                        tags: "business, growth, marketing",
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
                        publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 día atrás
                    },
                    {
                        id: 6,
                        title: "🧠 Learning Techniques for Students",
                        teleprompterEs: "Técnicas de aprendizaje para estudiantes en español...",
                        teleprompterEn: "Learning techniques for students in English...",
                        videoDescriptionEs: "Descripción de técnicas en español...",
                        videoDescriptionEn: "Techniques description in English...",
                        tagsListEs: "aprendizaje, estudiantes, técnicas",
                        tagsListEn: "learning, students, techniques",
                        publishedEs: true,
                        publishedEn: true,
                        publishedUrlEs: "https://example.com/es/video6",
                        publishedUrlEn: "https://example.com/en/video6",
                        tags: "education, learning, students",
                        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días atrás
                        publishedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 días atrás
                    },
                    {
                        id: 7,
                        title: "🌱 Sustainable Living Tips",
                        teleprompterEs: "Consejos para una vida sostenible en español...",
                        teleprompterEn: "Sustainable living tips in English...",
                        videoDescriptionEs: "Descripción de vida sostenible en español...",
                        videoDescriptionEn: "Sustainable living description in English...",
                        tagsListEs: "sostenible, ecología, vida",
                        tagsListEn: "sustainable, ecology, life",
                        publishedEs: false,
                        publishedEn: true,
                        publishedUrlEs: "",
                        publishedUrlEn: "https://example.com/en/video7",
                        tags: "sustainability, ecology, green",
                        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 días atrás
                        publishedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() // 18 días atrás
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
        // Compatibilidad: fallback a publishedEs/publishedEn si no existen statusEs/statusEn
        let statusEs = content.statusEs;
        let statusEn = content.statusEn;
        if (!statusEs) {
            if (typeof content.publishedEs === 'boolean') {
                statusEs = content.publishedEs ? 'published' : 'pending';
            } else {
                statusEs = 'pending';
            }
        }
        if (!statusEn) {
            if (typeof content.publishedEn === 'boolean') {
                statusEn = content.publishedEn ? 'published' : 'pending';
            } else {
                statusEn = 'pending';
            }
        }
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.dataset.id = content._id || content.id;
        row.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                viewContent(this.dataset.id);
            }
        });

        // Checkbox column (for bulk operations)
        const checkboxCell = document.createElement('td');
        checkboxCell.className = 'bulk-column d-none';
        checkboxCell.innerHTML = `
            <input type="checkbox" class="form-check-input item-checkbox" data-id="${content._id || content.id}">
        `;

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
            <div class="platform-status-container">
                ${getPlatformStatusIndicators(content)}
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

        row.appendChild(checkboxCell);
        row.appendChild(titleCell);
        row.appendChild(statusCell);
        row.appendChild(tagsCell);
        row.appendChild(actionsCell);
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

    // Add event listeners for bulk selection checkboxes
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation(); // Prevent row click
            handleItemSelection(this);
        });
    });
}

// Platform configuration management
function getPlatformConfig() {
    const defaultConfig = {
        youtube: { name: 'YouTube', icon: '📺', priority: 'high', active: true },
        tiktok: { name: 'TikTok', icon: '📱', priority: 'high', active: true },
        instagram: { name: 'Instagram', icon: '📷', priority: 'medium', active: true },
        twitter: { name: 'X', icon: '🐦', priority: 'medium', active: true },
        facebook: { name: 'Facebook', icon: '📘', priority: 'low', active: false }
    };

    const savedConfig = localStorage.getItem('platformConfig');
    if (savedConfig) {
        try {
            return { ...defaultConfig, ...JSON.parse(savedConfig) };
        } catch (e) {
            console.warn('Invalid platform config in localStorage, using defaults');
            return defaultConfig;
        }
    }
    return defaultConfig;
}

function setPlatformConfig(config) {
    localStorage.setItem('platformConfig', JSON.stringify(config));
    // Refresh the display
    const contentData = JSON.parse(localStorage.getItem('contentData'));
    if (contentData) {
        displayContents(contentData);
    }
}

function togglePlatform(platformKey) {
    const config = getPlatformConfig();
    if (config[platformKey]) {
        config[platformKey].active = !config[platformKey].active;
        setPlatformConfig(config);
    }
}

function getPlatformStatusIndicators(content) {
    // Get dynamic configuration
    const platformConfig = getPlatformConfig();

    // Sort platforms by priority and filter active ones
    const sortedPlatforms = Object.entries(platformConfig)
        .filter(([key, config]) => config.active)
        .sort((a, b) => {
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
        });

    let indicators = '';

    sortedPlatforms.forEach(([key, config]) => {
        // Get platform status with improved logic
        const platformData = content.platformStatus?.[key];
        let statusEs, statusEn, urlEs, urlEn;

        if (platformData) {
            // Use platform-specific data if available, but fallback to pending if platform data is undefined
            statusEs = platformData.statusEs !== undefined ? platformData.statusEs : 'pending';
            statusEn = platformData.statusEn !== undefined ? platformData.statusEn : 'pending';
            urlEs = platformData.urlEs || '';
            urlEn = platformData.urlEn || '';
        } else {
            // Each platform should be independent - default to pending if no platform-specific data
            statusEs = 'pending';
            statusEn = 'pending';
            urlEs = '';
            urlEn = '';
        }

        // IMPROVED: Determine container status based on actual publication state
        const hasPublishedContent = statusEs === 'published' || statusEn === 'published';
        const hasPendingContent = statusEs === 'pending' || statusEn === 'pending';
        const hasInProgressContent = statusEs === 'in-progress' || statusEn === 'in-progress';

        let containerStatusClass;
        if (hasPublishedContent) {
            containerStatusClass = 'has-published';
        } else if (hasInProgressContent) {
            containerStatusClass = 'has-in-progress';
        } else if (hasPendingContent) {
            containerStatusClass = 'has-pending';
        } else {
            containerStatusClass = 'no-data';
        }

        const priorityClass = `priority-${config.priority}`;

        indicators += `<span class="platform-indicator ${priorityClass} ${containerStatusClass}">
            <span class="platform-name">
                <span class="platform-icon">${config.icon}</span>
                ${config.name}
            </span>
            ${getPlatformLanguageIndicator('ES', statusEs, urlEs)}
            ${getPlatformLanguageIndicator('EN', statusEn, urlEn)}
        </span>`;
    });

    return indicators;
}

// NEW: Determine status based on published dates (more accurate)
function determinePlatformStatus(publishedDate, fallbackStatus) {
    if (publishedDate) {
        // If there's a published date, it's definitely published
        return 'published';
    } else if (fallbackStatus) {
        // Use the explicit status if available
        return fallbackStatus;
    } else {
        // Default to pending if no date and no explicit status
        return 'pending';
    }
}

// NEW: More conservative general status determination
function determineGeneralStatus(content, lang) {
    const publishedField = `published${lang}`;
    const statusField = `status${lang}`;
    const publishedDateField = `publishedDate${lang}`;

    // Check if there's a specific published date
    if (content[publishedDateField]) {
        return 'published';
    }

    // Check explicit status
    if (content[statusField]) {
        return content[statusField];
    }

    // Conservative fallback: only published if explicitly marked AND has URL
    if (content[publishedField] && content[`publishedUrl${lang}`]) {
        return 'published';
    }

    return 'pending';
}

function getPlatformLanguageIndicator(lang, status, url) {
    let statusClass = 'pending';
    if (status === 'in-progress') statusClass = 'in-progress';
    if (status === 'published') statusClass = 'published';

    const indicator = `<span class="platform-lang-indicator ${statusClass}" title="${lang} status: ${status}">${lang}</span>`;

    if (status === 'published' && url) {
        return `<a href="${url}" target="_blank" class="platform-lang-link">${indicator}</a>`;
    } else {
        return indicator;
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

// Platform Configuration Modal Functions
function showPlatformConfigModal() {
    const configList = document.getElementById('platformConfigList');
    const config = getPlatformConfig();

    configList.innerHTML = '';

    // Sort platforms by priority for display
    const sortedPlatforms = Object.entries(config).sort((a, b) => {
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
    });

    sortedPlatforms.forEach(([key, platform]) => {
        const item = document.createElement('div');
        item.className = 'platform-config-item';
        item.innerHTML = `
            <div class="platform-config-info">
                <span class="platform-config-icon">${platform.icon}</span>
                <div class="platform-config-details">
                    <div class="platform-config-name">${platform.name}</div>
                    <div class="platform-config-priority ${platform.priority}">${platform.priority} priority</div>
                </div>
            </div>
            <label class="platform-toggle">
                <input type="checkbox" ${platform.active ? 'checked' : ''} data-platform="${key}">
                <span class="platform-toggle-slider round"></span>
            </label>
        `;
        configList.appendChild(item);
    });

    // Add event listeners to toggles
    configList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const platformKey = this.dataset.platform;
            const config = getPlatformConfig();
            config[platformKey].active = this.checked;
            setPlatformConfig(config);
        });
    });

    document.getElementById('platformConfigModalBackdrop').style.display = 'block';
    document.getElementById('platformConfigModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function closePlatformConfigModal() {
    document.getElementById('platformConfigModalBackdrop').style.display = 'none';
    document.getElementById('platformConfigModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

function resetPlatformConfig() {
    if (confirm('¿Estás seguro de que quieres resetear la configuración de plataformas a los valores por defecto?')) {
        localStorage.removeItem('platformConfig');
        closePlatformConfigModal();
        // Refresh the display
        const contentData = JSON.parse(localStorage.getItem('contentData'));
        if (contentData) {
            displayContents(contentData);
        }
    }
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

// Bulk Operations Functions
let bulkMode = false;
let selectedItems = new Set();

function toggleBulkMode() {
    bulkMode = !bulkMode;
    selectedItems.clear();

    const bulkColumns = document.querySelectorAll('.bulk-column');
    const bulkActions = document.getElementById('bulkActions');
    const bulkModeBtn = document.getElementById('bulkModeBtn');
    const selectAll = document.getElementById('selectAll');

    if (bulkMode) {
        // Show bulk mode UI
        bulkColumns.forEach(col => col.classList.remove('d-none'));
        bulkActions.classList.remove('d-none');
        bulkModeBtn.innerHTML = '<i class="bi bi-x-square"></i> Exit Select';
        bulkModeBtn.classList.remove('btn-outline-secondary');
        bulkModeBtn.classList.add('btn-secondary');
        selectAll.checked = false;
    } else {
        // Hide bulk mode UI
        exitBulkMode();
    }
}

function exitBulkMode() {
    bulkMode = false;
    selectedItems.clear();

    const bulkColumns = document.querySelectorAll('.bulk-column');
    const bulkActions = document.getElementById('bulkActions');
    const bulkModeBtn = document.getElementById('bulkModeBtn');
    const selectAll = document.getElementById('selectAll');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');

    // Hide bulk mode UI
    bulkColumns.forEach(col => col.classList.add('d-none'));
    bulkActions.classList.add('d-none');
    bulkModeBtn.innerHTML = '<i class="bi bi-check2-square"></i> Select';
    bulkModeBtn.classList.remove('btn-secondary');
    bulkModeBtn.classList.add('btn-outline-secondary');

    // Uncheck all items
    selectAll.checked = false;
    itemCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function selectAllItems() {
    const selectAll = document.getElementById('selectAll');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');

    selectedItems.clear();

    itemCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
        if (selectAll.checked) {
            selectedItems.add(checkbox.dataset.id);
        }
    });

    updateBulkActionButton();
}

function handleItemSelection(checkbox) {
    const itemId = checkbox.dataset.id;

    if (checkbox.checked) {
        selectedItems.add(itemId);
    } else {
        selectedItems.delete(itemId);
    }

    // Update select all checkbox
    const selectAll = document.getElementById('selectAll');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    const checkedCount = Array.from(itemCheckboxes).filter(cb => cb.checked).length;

    selectAll.checked = checkedCount === itemCheckboxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < itemCheckboxes.length;

    updateBulkActionButton();
}

function updateBulkActionButton() {
    const applyBtn = document.getElementById('applyBulkAction');
    applyBtn.disabled = selectedItems.size === 0;
    applyBtn.textContent = selectedItems.size > 0 ? `Apply (${selectedItems.size})` : 'Apply';
}

function applyBulkAction() {
    const action = document.getElementById('bulkActionSelect').value;

    if (!action || selectedItems.size === 0) {
        alert('Por favor selecciona una acción y al menos un elemento.');
        return;
    }

    if (action === 'delete-selected') {
        if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedItems.size} elementos seleccionados?`)) {
            return;
        }
        bulkDeleteItems();
    } else if (action === 'export-selected') {
        exportSelectedItems();
    } else if (action.startsWith('mark-')) {
        bulkUpdateStatus(action);
    }
}

function bulkUpdateStatus(action) {
    const updates = [];
    const [, status, lang] = action.split('-'); // mark-published-es => ['mark', 'published', 'es']

    selectedItems.forEach(itemId => {
        const update = {
            id: itemId,
            platformStatus: {}
        };

        // Apply to all platforms for now (could be made more specific)
        const platforms = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];
        platforms.forEach(platform => {
            if (!update.platformStatus[platform]) {
                update.platformStatus[platform] = {};
            }

            if (lang === 'es') {
                update.platformStatus[platform].statusEs = status;
                if (status === 'published') {
                    update.platformStatus[platform].publishedDateEs = new Date();
                }
            } else {
                update.platformStatus[platform].statusEn = status;
                if (status === 'published') {
                    update.platformStatus[platform].publishedDateEn = new Date();
                }
            }
        });

        updates.push(update);
    });

    // Apply updates via API
    Promise.all(updates.map(update =>
        fetch(`/api/contents/${update.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
        })
    ))
    .then(responses => {
        if (responses.every(r => r.ok)) {
            alert(`✅ Successfully updated ${selectedItems.size} items!`);
            loadContentData(); // Refresh the list
            exitBulkMode();
        } else {
            throw new Error('Some updates failed');
        }
    })
    .catch(error => {
        console.error('Bulk update error:', error);
        alert('❌ Error updating some items. Please try again.');
    });
}

function bulkDeleteItems() {
    const deletions = Array.from(selectedItems).map(itemId =>
        fetch(`/api/contents/${itemId}`, { method: 'DELETE' })
    );

    Promise.all(deletions)
    .then(responses => {
        if (responses.every(r => r.ok)) {
            alert(`✅ Successfully deleted ${selectedItems.size} items!`);
            loadContentData(); // Refresh the list
            exitBulkMode();
        } else {
            throw new Error('Some deletions failed');
        }
    })
    .catch(error => {
        console.error('Bulk delete error:', error);
        alert('❌ Error deleting some items. Please try again.');
    });
}

function exportSelectedItems() {
    const contentData = JSON.parse(localStorage.getItem('contentData'));
    const selectedContent = contentData.filter(item =>
        selectedItems.has(item._id || item.id.toString())
    );

    const exportData = {
        exportDate: new Date().toISOString(),
        totalItems: selectedContent.length,
        items: selectedContent
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`📤 Exported ${selectedContent.length} items successfully!`);
}