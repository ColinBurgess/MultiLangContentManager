// Content class to structure our data
class Content {
    constructor(data) {
        this.id = data._id || Date.now();
        this.title = data.title;
        this.scriptEs = data.scriptEs;
        this.scriptEn = data.scriptEn;
        this.descriptionEs = data.descriptionEs;
        this.descriptionEn = data.descriptionEn;
        this.tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(tag => tag.trim());
        this.socialLinks = data.socialLinks;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

// ContentManager class to handle data operations
class ContentManager {
    constructor() {
        this.contents = [];
        this.apiUrl = 'http://localhost:3000/api';
    }

    async loadContents() {
        try {
            const response = await fetch(`${this.apiUrl}/contents`);
            const data = await response.json();
            this.contents = data.map(item => new Content(item));
            return this.contents;
        } catch (error) {
            console.error('Error loading contents:', error);
            return [];
        }
    }

    async addContent(contentData) {
        try {
            const response = await fetch(`${this.apiUrl}/contents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contentData)
            });
            const data = await response.json();
            const content = new Content(data);
            this.contents.unshift(content);
            return content;
        } catch (error) {
            console.error('Error adding content:', error);
            throw error;
        }
    }

    async deleteContent(id) {
        try {
            await fetch(`${this.apiUrl}/contents/${id}`, {
                method: 'DELETE'
            });
            this.contents = this.contents.filter(content => content.id !== id);
        } catch (error) {
            console.error('Error deleting content:', error);
            throw error;
        }
    }

    async updateContent(id, contentData) {
        try {
            const response = await fetch(`${this.apiUrl}/contents/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contentData)
            });
            const data = await response.json();
            const index = this.contents.findIndex(content => content.id === id);
            if (index !== -1) {
                this.contents[index] = new Content(data);
                return this.contents[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating content:', error);
            throw error;
        }
    }

    async searchContents(query) {
        try {
            const response = await fetch(`${this.apiUrl}/contents/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            return data.map(item => new Content(item));
        } catch (error) {
            console.error('Error searching contents:', error);
            return [];
        }
    }
}

// UI class to handle interface interactions
class UI {
    constructor(contentManager) {
        this.contentManager = contentManager;
        this.contentForm = document.getElementById('contentForm');
        this.contentList = document.getElementById('contentList');
        this.searchInput = document.getElementById('searchInput');
        this.modal = new bootstrap.Modal(document.getElementById('contentModal'));

        this.setupEventListeners();
        this.initializeContent();
    }

    async initializeContent() {
        await this.contentManager.loadContents();
        this.renderContentList();
    }

    setupEventListeners() {
        this.contentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const formData = {
            title: this.contentForm.title.value,
            scriptEs: this.contentForm.scriptEs.value,
            scriptEn: this.contentForm.scriptEn.value,
            descriptionEs: this.contentForm.descriptionEs.value,
            descriptionEn: this.contentForm.descriptionEn.value,
            tags: this.contentForm.tags.value,
            socialLinks: this.contentForm.socialLinks.value
        };

        try {
            await this.contentManager.addContent(formData);
            this.contentForm.reset();
            this.renderContentList();
        } catch (error) {
            alert('Error saving content. Please try again.');
        }
    }

    async handleSearch(e) {
        const query = e.target.value;
        const filteredContents = await this.contentManager.searchContents(query);
        this.renderContentList(filteredContents);
    }

    renderContentList(contents = this.contentManager.contents) {
        this.contentList.innerHTML = '';
        contents.forEach(content => {
            const element = this.createContentElement(content);
            this.contentList.appendChild(element);
        });
    }

    createContentElement(content) {
        const element = document.createElement('div');
        element.className = 'list-group-item list-group-item-action';
        element.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${content.title}</h5>
                <small>${new Date(content.createdAt).toLocaleDateString()}</small>
            </div>
            <p class="mb-1 content-preview">${content.descriptionEs}</p>
            <div class="tag-list">
                ${content.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="mt-2">
                <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </div>
        `;

        element.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this content?')) {
                try {
                    await this.contentManager.deleteContent(content.id);
                    this.renderContentList();
                } catch (error) {
                    alert('Error deleting content. Please try again.');
                }
            }
        });

        element.addEventListener('click', () => this.showContentDetails(content));
        return element;
    }

    showContentDetails(content) {
        const modalTitle = document.querySelector('#contentModal .modal-title');
        const modalBody = document.querySelector('#contentModal .modal-body');

        modalTitle.textContent = content.title;
        modalBody.innerHTML = `
            <div class="content-details">
                <h6>Script (Spanish)</h6>
                <pre class="bg-light p-3">${content.scriptEs}</pre>

                <h6>Script (English)</h6>
                <pre class="bg-light p-3">${content.scriptEn}</pre>

                <h6>Description (Spanish)</h6>
                <p>${content.descriptionEs}</p>

                <h6>Description (English)</h6>
                <p>${content.descriptionEn}</p>

                <h6>Tags</h6>
                <div class="tag-list mb-3">
                    ${content.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>

                <h6>Social Links</h6>
                <div class="social-links">
                    ${content.socialLinks.split('\n').map(link => `<div>${link}</div>`).join('')}
                </div>
            </div>
        `;

        this.modal.show();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const contentManager = new ContentManager();
    const ui = new UI(contentManager);
});