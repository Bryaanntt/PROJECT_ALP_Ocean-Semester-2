const Modules = {
    async loadAll() {
        const container = document.getElementById('all-modules-grid');
        if (!container) return;
        
        try {
            const modules = await API.getModules();
            AppState.setModules(modules);
            
            if (!modules || modules.length === 0) {
                container.innerHTML = '<p style="text-align:center;padding:2rem;">Belum ada modul.</p>';
                return;
            }
            
            container.innerHTML = modules.map(m => this.renderModuleCard(m)).join('');
            this.initScrollAnimation();
            
        } catch (error) {
            console.error('Error loading modules:', error);
            container.innerHTML = '<p style="color:red;text-align:center;">Gagal mengambil data modul</p>';
        }
    },
    
    async loadHomePreview() {
        const container = document.getElementById('home-modules-preview');
        if (!container) return;
        
        try {
            const modules = await API.getModules();
            if (!modules || modules.length === 0) return;
            
            const m = modules[0];
            container.innerHTML = `
                <div style="width:320px;background:rgba(255,255,255,0.05);border-radius:16px;overflow:hidden;padding:12px;margin:0 auto;">
                    <img src="${m.thumbnail || '/Foto/Jona4.jpg'}" alt="${m.title}"
                        style="width:100%;height:180px;object-fit:cover;border-radius:12px;display:block;"
                        onerror="this.style.display='none'">
                    <h3 style="margin:12px 0 8px 0;">${Utils.escapeHtml(m.title)}</h3>
                    <p style="font-size:14px;margin-bottom:12px;color:var(--text-muted);">${Utils.escapeHtml(m.description)}</p>
                    <button onclick="window.location.href='/prequiz/${m.id}'"
                        style="width:100%;padding:10px;background:#00bfff;color:white;border:none;border-radius:8px;cursor:pointer;">
                        📖 Baca Modul
                    </button>
                </div>
            `;
        } catch (error) {
            console.error('Error loading home preview:', error);
        }
    },
    
    renderModuleCard(module) {
        return `
            <div class="module-card reveal-card" onclick="window.location.href='/prequiz/${module.id}'" style="cursor:pointer;">
                <div class="module-thumb" style="position:relative;height:200px;border-radius:16px 16px 0 0;overflow:hidden;">
                    <img src="${module.thumbnail || '/Foto/Jona4.jpg'}" alt="${module.title}"
                        style="width:100%;height:100%;object-fit:cover;"
                        onerror="this.style.display='none'">
                    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(10,22,40,0.7) 100%);"></div>
                </div>
                <div class="module-body" style="padding:1.25rem;">
                    <div class="module-title" style="font-weight:700;font-size:1.05rem;margin-bottom:0.5rem;">${Utils.escapeHtml(module.title)}</div>
                    <div class="module-desc" style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem;">${Utils.escapeHtml(module.description)}</div>
                    <button class="btn-primary" style="font-size:0.82rem;padding:8px 16px;">📖 Buka Modul</button>
                </div>
            </div>
        `;
    },
    
    searchModules(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const grid = document.getElementById('all-modules-grid');
        const noResults = document.getElementById('no-results');
        
        if (!grid) return;
        
        const filtered = term 
            ? AppState.getModules().filter(m => 
                (m.title || '').toLowerCase().includes(term) ||
                (m.description || '').toLowerCase().includes(term))
            : AppState.getModules();
        
        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        if (noResults) noResults.style.display = 'none';
        grid.innerHTML = filtered.map(m => this.renderModuleCard(m)).join('');
        this.initScrollAnimation();
    },
    
    initScrollAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.reveal-card').forEach(el => observer.observe(el));
    }
};

window.Modules = Modules;