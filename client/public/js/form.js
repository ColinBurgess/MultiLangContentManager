document.addEventListener('DOMContentLoaded', () => {
    const contentForm = document.getElementById('contentForm');
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');

    // Configurar contadores de caracteres
    const characterCounters = [
        { field: 'tagsListEs', limit: 500 },
        { field: 'tagsListEn', limit: 500 },
        { field: 'twitterPostEs', limit: 180 },
        { field: 'twitterPostEn', limit: 180 }
    ];

    // Inicializar contadores de caracteres
    characterCounters.forEach(counter => {
        const field = document.getElementById(counter.field);
        const countDisplay = document.getElementById(`${counter.field}Count`);

        field.addEventListener('input', () => {
            const remaining = counter.limit - field.value.length;
            countDisplay.textContent = remaining;

            // Cambiar color si está cerca del límite
            if (remaining < 20) {
                countDisplay.style.color = '#dc3545';
            } else {
                countDisplay.style.color = '';
            }
        });
    });

    // Si hay un ID, cargar el contenido para editar
    if (contentId) {
        loadContent(contentId);
        document.querySelector('.card-header h5').textContent = 'Editar Contenido';
    }

    async function loadContent(id) {
        try {
            const response = await fetch(`/api/contents/${id}`);
            const content = await response.json();

            // Cargar todos los campos
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
            document.getElementById('tags').value = content.tags.join(', ');

            // Cargar estados de publicación
            document.getElementById('publishedEs').checked = content.publishedEs || false;
            document.getElementById('publishedEn').checked = content.publishedEn || false;
            document.getElementById('publishedUrlEs').value = content.publishedUrlEs || '';
            document.getElementById('publishedUrlEn').value = content.publishedUrlEn || '';

            // Actualizar todos los contadores
            characterCounters.forEach(counter => {
                const field = document.getElementById(counter.field);
                const countDisplay = document.getElementById(`${counter.field}Count`);
                const remaining = counter.limit - field.value.length;
                countDisplay.textContent = remaining;
                countDisplay.style.color = remaining < 20 ? '#dc3545' : '';
            });
        } catch (error) {
            console.error('Error al cargar el contenido:', error);
            alert('Error al cargar el contenido');
        }
    }

    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

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
            // Incluir estados de publicación
            publishedEs: document.getElementById('publishedEs').checked,
            publishedEn: document.getElementById('publishedEn').checked,
            publishedUrlEs: document.getElementById('publishedUrlEs').value,
            publishedUrlEn: document.getElementById('publishedUrlEn').value
        };

        try {
            const url = contentId ? `/api/contents/${contentId}` : '/api/contents';
            const method = contentId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            console.error('Error al guardar el contenido:', error);
            alert('Error al guardar el contenido');
        }
    });
});