const API = {
    baseUrl: '/api',
    
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    },
    
    // Module endpoints
    getModules() {
        return this.request('/modules');
    },
    
    getModule(id) {
        return this.request(`/modules/${id}`);
    },
    
    getModuleContents(id) {
        return this.request(`/modules/${id}/contents`);
    },
    
    // Quiz endpoints
    getQuizzes(moduleId) {
        return this.request(`/quizzes/module/${moduleId}`);
    },
    
    // Form submissions
    submitPreQuiz(moduleId, formData) {
        return fetch(`/prequiz/${moduleId}`, {
            method: 'POST',
            body: formData
        });
    },
    
    submitPostQuiz(moduleId, formData) {
        return fetch(`/postquiz/${moduleId}`, {
            method: 'POST',
            body: formData
        });
    }
};

// Export for use in other files
window.API = API;