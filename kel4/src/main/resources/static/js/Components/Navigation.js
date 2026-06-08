const Navigation = {
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('nav-mobile');
        if (mobileMenu) {
            mobileMenu.classList.toggle('open');
        }
    },
    
    closeMobileMenu() {
        const mobileMenu = document.getElementById('nav-mobile');
        if (mobileMenu) {
            mobileMenu.classList.remove('open');
        }
    },
    
    showPage(page) {
        const map = {
            home: '/',
            index: '/',
            modules: '/modules',
            tips: '/tips'
        };
        const dest = map[page];
        if (dest) window.location.href = dest;
    },
    
    init() {
        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) {
                this.closeMobileMenu();
            }
        });
    }
};

// Export
window.Navigation = Navigation;