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

            // Set status fields
            document.getElementById('statusEs').value = content.statusEs || 'pending';
            document.getElementById('statusEn').value = content.statusEn || 'pending';

            // Update language indicators
            updateLanguageIndicator('Es');
            updateLanguageIndicator('En');

            // Set publication dates if they exist
            if (content.publishedDateEs) {
                const dateEs = new Date(content.publishedDateEs);
                document.getElementById('publishedDateEs').value = dateEs.toISOString().split('T')[0];
            } else {
                document.getElementById('publishedDateEs').value = '';
            }

            if (content.publishedDateEn) {
                const dateEn = new Date(content.publishedDateEn);
                document.getElementById('publishedDateEn').value = dateEn.toISOString().split('T')[0];
            } else {
                document.getElementById('publishedDateEn').value = '';
            }

            document.getElementById('publishedUrlEs').value = content.publishedUrlEs || '';
            document.getElementById('publishedUrlEn').value = content.publishedUrlEn || '';

            // Trigger counters update
            document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
                const event = new Event('input');
                textarea.dispatchEvent(event);
            });
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            alert('Error loading content. Please try again.');
            window.location.href = '/';
        });
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
        publishedDateEs: document.getElementById('publishedDateEs').value || null,
        publishedDateEn: document.getElementById('publishedDateEn').value || null,
        publishedUrlEs: document.getElementById('publishedUrlEs').value,
        publishedUrlEn: document.getElementById('publishedUrlEn').value
    };

    // Capturar explícitamente los valores de status desde los selectores
    const statusEs = document.getElementById('statusEs').value;
    const statusEn = document.getElementById('statusEn').value;
    
    // Establecer los campos de status y published según los valores seleccionados
    formData.statusEs = statusEs;
    formData.statusEn = statusEn;
    formData.publishedEs = (statusEs === 'published');
    formData.publishedEn = (statusEn === 'published');
    
    console.log('Guardando contenido con estados:', {
        statusEs: formData.statusEs,
        statusEn: formData.statusEn,
        publishedEs: formData.publishedEs,
        publishedEn: formData.publishedEn
    });

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
        console.log('Respuesta del servidor:', data);
        
        // Verificar que los estados se hayan actualizado correctamente
        if (data.statusEs !== formData.statusEs || data.statusEn !== formData.statusEn) {
            console.warn('Advertencia: Los estados devueltos por el servidor difieren de los enviados:', {
                enviado: {statusEs: formData.statusEs, statusEn: formData.statusEn},
                recibido: {statusEs: data.statusEs, statusEn: data.statusEn}
            });
        }
        
        // Show success message and redirect
        alert(contentId ? 'Content updated successfully!' : 'Content added successfully!');
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Error saving content:', error);
        alert('Error saving content. Please try again.');
    });
}