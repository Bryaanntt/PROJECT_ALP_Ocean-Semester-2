const Theme = {
    isLight: false,
    
    init() {
        this.isLight = localStorage.getItem('og_theme') === 'light';
        this.apply();
    },
    
    apply() {
        document.body.classList.toggle('light', this.isLight);
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.textContent = this.isLight ? '🌙' : '☀️';
        });
    },
    
    toggle() {
        this.isLight = !this.isLight;
        localStorage.setItem('og_theme', this.isLight ? 'light' : 'dark');
        this.apply();
    }
};

// Initialize
Theme.init();

window.Theme = Theme;