// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core services
    Theme.init();
    Auth.init();
    Navigation.init();
    Modal.init();
    
    // Update auth UI
    Auth.updateNavUI();
    
    // Initialize page-specific logic
    const path = window.location.pathname;
    
    if (path === '/' || path === '/homepage.html') {
        Modules.loadHomePreview();
    } else if (path === '/modules' || path === '/modules.html') {
        Modules.loadAll();
    } else if (path.includes('/tips')) {
        // Tips page initialization
        Modules.initScrollAnimation();
    }
    
    // Initialize scroll animations on all pages
    Modules.initScrollAnimation();
});

// Make global functions available for inline handlers
window.toggleMobileMenu = () => Navigation.toggleMobileMenu();
window.openAuth = (tab) => UI.openAuth(tab);
window.closeAuth = () => UI.closeAuth();
window.switchAuthTab = (tab) => UI.switchAuthTab(tab);
window.doLogin = () => UI.doLogin();
window.doSignup = () => UI.doSignup();
window.toggleTheme = () => Theme.toggle();
window.closeModal = () => Modal.closeModal();
window.closeModalOutside = (e) => Modal.closeOnOutsideClick(e, 'module-modal');
window.switchTab = (name, btn) => Modal.switchTab(name, btn);
window.switchTabById = (name) => Modal.switchTab(name);
window.openModule = (id) => Modal.openModule(id);
window.submitQuiz = (moduleId) => Quiz.submitModalQuiz(moduleId);
window.filterTips = (kategori, btn) => Utils.filterTips(kategori, btn);