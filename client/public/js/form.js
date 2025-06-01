document.addEventListener('DOMContentLoaded', function() {
    // Initialize character counters for text areas with limits
    initCharacterCounters();

    // Check if we're editing existing content
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');

    if (contentId) {
        // We're editing existing content
        loadContentData(contentId);
    }

    // Set up form submission handler
    document.getElementById('contentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveContent(contentId);
    });
});

function initCharacterCounters() {
    // Set up character counters for text areas with maxlength
    const textAreasWithLimits = document.querySelectorAll('textarea[maxlength]');

    textAreasWithLimits.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        const counterId = textarea.id + 'Count';
        const counter = document.getElementById(counterId);

        if (counter) {
            // Update counter when text changes
            textarea.addEventListener('input', function() {
                const remainingChars = maxLength - this.value.length;
                counter.textContent = remainingChars;

                // Add visual indication when approaching limit
                if (remainingChars < 20) {
                    counter.style.color = '#E53E3E';
                } else {
                    counter.style.color = '';
                }
            });

            // Initial count
            const remainingChars = maxLength - textarea.value.length;
            counter.textContent = remainingChars;
        }
    });
}

function loadContentData(contentId) {
    // Fetch content from API
    fetch(`/api/contents/${contentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch content');
            }
            return response.json();
        })
        .then(content => {
            // Update page title
            document.querySelector('.page-title').textContent = 'Edit Content';

            // Fill the form with the content data
            document.getElementById('title').value = content.title || '';
            document.getElementById('teleprompterEs').value = content.teleprompterEs || '';
            document.getElementById('teleprompterEn').value = content.teleprompterEn || '';
            document.getElementById('videoDescriptionEs').value = content.videoDescriptionEs || '';
            document.getElementById('videoDescriptionEn').value = content.videoDescriptionEn || '';
            document.getElementById('tagsListEs').value = content.tagsListEs || '';
            document.getElementById('tagsListEn').value = content.tagsListEn || '';
            document.getElementById('pinnedCommentEs').value = content.pinnedCommentEs || '';
            document.getElementById('pinnedCommentEn').value = content.pinnedCommentEn || '';
            document.getElementById('tiktokDescriptionEs').value = content.tiktokDescriptionEs || '';
            document.getElementById('tiktokDescriptionEn').value = content.tiktokDescriptionEn || '';
            document.getElementById('twitterPostEs').value = content.twitterPostEs || '';
            document.getElementById('twitterPostEn').value = content.twitterPostEn || '';
            document.getElementById('facebookDescriptionEs').value = content.facebookDescriptionEs || '';
            document.getElementById('facebookDescriptionEn').value = content.facebookDescriptionEn || '';

            // Handle tags (can be array or string)
            if (Array.isArray(content.tags)) {
                document.getElementById('tags').value = content.tags.join(', ');
            } else {
                document.getElementById('tags').value = content.tags || '';
            }

            // Load platform-specific data
            loadPlatformData(content);

            // Trigger counters update
            document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
                const event = new Event('input');
                textarea.dispatchEvent(event);
            });
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            showSaveNotification('Error al cargar el contenido. Por favor, inténtalo de nuevo.', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        });
}

function loadPlatformData(content) {
    const platforms = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];

    platforms.forEach(platform => {
        const platformData = content.platformStatus?.[platform];

        if (platformData) {
            // Load status
            const statusEsElement = document.getElementById(`${platform}_statusEs`);
            const statusEnElement = document.getElementById(`${platform}_statusEn`);

            if (statusEsElement) statusEsElement.value = platformData.statusEs || 'pending';
            if (statusEnElement) statusEnElement.value = platformData.statusEn || 'pending';

            // Load publication dates
            if (platformData.publishedDateEs) {
                const dateEs = new Date(platformData.publishedDateEs);
                const dateEsElement = document.getElementById(`${platform}_publishedDateEs`);
                if (dateEsElement) dateEsElement.value = dateEs.toISOString().split('T')[0];
            }

            if (platformData.publishedDateEn) {
                const dateEn = new Date(platformData.publishedDateEn);
                const dateEnElement = document.getElementById(`${platform}_publishedDateEn`);
                if (dateEnElement) dateEnElement.value = dateEn.toISOString().split('T')[0];
            }

            // Load URLs
            const urlEsElement = document.getElementById(`${platform}_urlEs`);
            const urlEnElement = document.getElementById(`${platform}_urlEn`);

            if (urlEsElement) urlEsElement.value = platformData.urlEs || '';
            if (urlEnElement) urlEnElement.value = platformData.urlEn || '';
        }
    });
}

function collectPlatformData() {
    const platforms = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];
    const platformStatus = {};

    platforms.forEach(platform => {
        const statusEs = document.getElementById(`${platform}_statusEs`)?.value || 'pending';
        const statusEn = document.getElementById(`${platform}_statusEn`)?.value || 'pending';
        const publishedDateEs = document.getElementById(`${platform}_publishedDateEs`)?.value || null;
        const publishedDateEn = document.getElementById(`${platform}_publishedDateEn`)?.value || null;
        const urlEs = document.getElementById(`${platform}_urlEs`)?.value || '';
        const urlEn = document.getElementById(`${platform}_urlEn`)?.value || '';

        platformStatus[platform] = {
            statusEs,
            statusEn,
            urlEs,
            urlEn,
            publishedDateEs: publishedDateEs ? new Date(publishedDateEs + 'T00:00:00.000Z') : null,
            publishedDateEn: publishedDateEn ? new Date(publishedDateEn + 'T00:00:00.000Z') : null
        };

        // Debug log for the first platform
        if (platform === 'youtube') {
            console.log('YouTube data collected:', {
                statusEs,
                statusEn,
                publishedDateEs: publishedDateEs,
                publishedDateEn: publishedDateEn,
                publishedDateEsObject: platformStatus[platform].publishedDateEs,
                publishedDateEnObject: platformStatus[platform].publishedDateEn,
                urlEs,
                urlEn
            });
        }
    });

    return platformStatus;
}

function saveContent(contentId) {
    // Get form data
    const formData = {
        title: document.getElementById('title').value,
        teleprompterEs: document.getElementById('teleprompterEs').value,
        teleprompterEn: document.getElementById('teleprompterEn').value,
        videoDescriptionEs: document.getElementById('videoDescriptionEs').value,
        videoDescriptionEn: document.getElementById('videoDescriptionEn').value,
        tagsListEs: document.getElementById('tagsListEs').value,
        tagsListEn: document.getElementById('tagsListEn').value,
        pinnedCommentEs: document.getElementById('pinnedCommentEs').value,
        pinnedCommentEn: document.getElementById('pinnedCommentEn').value,
        tiktokDescriptionEs: document.getElementById('tiktokDescriptionEs').value,
        tiktokDescriptionEn: document.getElementById('tiktokDescriptionEn').value,
        twitterPostEs: document.getElementById('twitterPostEs').value,
        twitterPostEn: document.getElementById('twitterPostEn').value,
        facebookDescriptionEs: document.getElementById('facebookDescriptionEs').value,
        facebookDescriptionEn: document.getElementById('facebookDescriptionEn').value,
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),

        // Collect platform-specific data
        platformStatus: collectPlatformData()
    };

    // For backward compatibility, set general published status based on YouTube (primary platform)
    const youtubeStatus = formData.platformStatus.youtube;
    formData.publishedEs = youtubeStatus.statusEs === 'published';
    formData.publishedEn = youtubeStatus.statusEn === 'published';
    formData.statusEs = youtubeStatus.statusEs;
    formData.statusEn = youtubeStatus.statusEn;
    formData.publishedDateEs = youtubeStatus.publishedDateEs;
    formData.publishedDateEn = youtubeStatus.publishedDateEn;
    formData.publishedUrlEs = youtubeStatus.urlEs;
    formData.publishedUrlEn = youtubeStatus.urlEn;

    console.log('Saving content with platform data:', formData);

    // API URL and method
    let url = '/api/contents';
    let method = 'POST';

    if (contentId) {
        // If editing, use PUT method and add ID to URL
        url = `/api/contents/${contentId}`;
        method = 'PUT';
    }

    // Send data to API
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);

        // Show success message and redirect
        showSaveNotification(contentId ? 'Contenido actualizado correctamente!' : 'Contenido agregado correctamente!', 'success');

        // Redirect after a short delay to let user see the notification
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    })
    .catch(error => {
        console.error('Error saving content:', error);
        showSaveNotification('Error al guardar el contenido. Por favor, inténtalo de nuevo.', 'error');
    });
}

function showSaveNotification(message, type) {
    // Check if a notification already exists and remove it
    const existingNotification = document.querySelector('.save-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `save-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after animation completes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}