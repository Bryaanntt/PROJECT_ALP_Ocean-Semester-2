// Make searchModules globally available for inline oninput
window.searchModules = (term) => {
    Modules.searchModules(term);
};

document.addEventListener('DOMContentLoaded', () => {
    // Only run on modules page
    if (!window.location.pathname.includes('/modules')) return;
    
    // Load all modules
    Modules.loadAll();
});