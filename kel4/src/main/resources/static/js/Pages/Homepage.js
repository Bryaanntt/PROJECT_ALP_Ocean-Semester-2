document.addEventListener('DOMContentLoaded', () => {
    // Only run on homepage
    if (!window.location.pathname === '/' && !window.location.pathname === '/homepage.html') return;
    
    // Load module preview
    Modules.loadHomePreview();
    
    // Initialize scroll animations
    Modules.initScrollAnimation();
});