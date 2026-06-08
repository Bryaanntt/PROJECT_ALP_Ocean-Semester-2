const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    },
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    },
    
    closeOnOutsideClick(event, modalId) {
        if (event.target === document.getElementById(modalId)) {
            this.close(modalId);
        }
    },
    
    // Module Modal specific
    async openModule(id) {
        AppState.setCurrentModuleId(id);
        
        try {
            const module = await API.getModule(id);
            const quizzes = await API.getQuizzes(id);
            
            this.renderModuleModal(module, quizzes);
            this.open('module-modal');
            this.switchTab('materi');
            
        } catch (error) {
            console.error('Failed to open module:', error);
            Utils.showToast('Gagal membuka modul: ' + error.message, 'error');
        }
    },
    
    renderModuleModal(module, quizzes) {
        // Hero background
        const hero = document.getElementById('modal-hero');
        if (hero) {
            hero.style.background = module.bg || 'linear-gradient(135deg,#0a1628,#0e3d6e)';
        }
        
        // Title & description
        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.textContent = module.title || '';
        
        const descEl = document.getElementById('modal-desc');
        if (descEl) descEl.textContent = module.description || '';
        
        // Content
        const materiEl = document.getElementById('materi-content');
        if (materiEl) {
            materiEl.innerHTML = module.content 
                ? Utils.renderBlocks(module.content)
                : '<p style="color:var(--text-muted)">Konten modul belum tersedia.</p>';
        }
        
        // Quiz
        Quiz.renderInModal(quizzes, module.id);
    },
    
    switchTab(tabName, btn = null) {
        const tabs = document.querySelectorAll('.modal-tab');
        const panels = document.querySelectorAll('.tab-panel');
        
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        if (btn) btn.classList.add('active');
        
        const panel = document.getElementById(`tab-${tabName}`);
        if (panel) panel.classList.add('active');
    },
    
    closeModal() {
        this.close('module-modal');
    },
    
    init() {
        // Escape key closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close('module-modal');
                UI.closeAuth();
            }
        });
    }
};

// Export
window.Modal = Modal;