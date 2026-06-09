// ---- THEME ----
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

// ---- AUTH ----
const Auth = {
    currentUser: null,
    registeredUsers: {},

    init() {
        try { this.currentUser = JSON.parse(sessionStorage.getItem('og_user')); } catch(e) {}
        try { this.registeredUsers = JSON.parse(localStorage.getItem('og_users') || '{}'); } catch(e) {}
        this.updateNavUI();
    },

    updateNavUI() {
        const area = document.getElementById('nav-auth-area');
        if (!area) return;
        area.innerHTML = this.currentUser
            ? `<span style="font-size:0.85rem;color:var(--text-muted);margin-right:8px;">👤 ${this.currentUser.username}</span>
            <button class="btn-outline" style="padding:7px 16px;font-size:0.82rem;" onclick="Auth.logout()">Keluar</button>`
            : `<button class="btn-primary" style="padding:8px 18px;font-size:0.85rem;" onclick="UI.openAuth('login')">Masuk / Daftar</button>`;
    },

    login() {
        const user = document.getElementById('login-username')?.value.trim();
        const pass = document.getElementById('login-password')?.value;
        const err  = document.getElementById('auth-error-login');
        if (!user || !pass) { if(err) err.textContent = 'Username dan password wajib diisi.'; return; }
        if (!this.registeredUsers[user] || this.registeredUsers[user] !== pass) {
            if(err) err.textContent = 'Username atau password salah.'; return;
        }
        this.currentUser = { username: user };
        sessionStorage.setItem('og_user', JSON.stringify(this.currentUser));
        UI.closeAuth();
        this.updateNavUI();
    },

    signup() {
        const user = document.getElementById('signup-username')?.value.trim();
        const pass = document.getElementById('signup-password')?.value;
        const conf = document.getElementById('signup-confirm')?.value;
        const err  = document.getElementById('auth-error-signup');
        if (!user || !pass || !conf) { if(err) err.textContent = 'Semua kolom wajib diisi.'; return; }
        if (pass.length < 6)         { if(err) err.textContent = 'Password minimal 6 karakter.'; return; }
        if (pass !== conf)           { if(err) err.textContent = 'Password tidak cocok.'; return; }
        if (this.registeredUsers[user]) { if(err) err.textContent = 'Username sudah digunakan.'; return; }
        this.registeredUsers[user] = pass;
        localStorage.setItem('og_users', JSON.stringify(this.registeredUsers));
        this.currentUser = { username: user };
        sessionStorage.setItem('og_user', JSON.stringify(this.currentUser));
        UI.closeAuth();
        this.updateNavUI();
    },

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('og_user');
        this.updateNavUI();
    }
};

// ---- UI ----
const UI = {
    openAuth(tab = 'login') {
        document.getElementById('auth-modal')?.classList.add('open');
        this.switchAuthTab(tab);
    },

    closeAuth() {
        document.getElementById('auth-modal')?.classList.remove('open');
    },

    switchAuthTab(tab) {
        document.getElementById('auth-tab-login')?.classList.toggle('active', tab === 'login');
        document.getElementById('auth-tab-signup')?.classList.toggle('active', tab === 'signup');
        const lp = document.getElementById('auth-panel-login');
        const sp = document.getElementById('auth-panel-signup');
        if (lp) lp.style.display = tab === 'login'  ? 'block' : 'none';
        if (sp) sp.style.display = tab === 'signup' ? 'block' : 'none';
    },

    doLogin()  { Auth.login(); },
    doSignup() { Auth.signup(); }
};

// ---- NAVIGATION ----
const Navigation = {
    init() {
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                Modal.close();
                UI.closeAuth();
            }
        });
    },

    toggleMobileMenu() {
        document.getElementById('nav-mobile')?.classList.toggle('open');
    }
};

// ---- MODAL ----
const Modal = {
    init() {},

    close() {
        document.getElementById('module-modal')?.classList.remove('open');
        document.body.style.overflow = '';
    },

    closeModal() { this.close(); },

    closeOnOutsideClick(e, id) {
        if (e.target === document.getElementById(id)) this.close();
    },

    switchTab(name, btn) {
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active'));
        if (btn) btn.classList.add('active');
        document.getElementById('tab-' + name)?.classList.add('active');
    },

    async openModule(id) {
        try {
            const res = await fetch('/api/modules/' + id);
            if (!res.ok) throw new Error('Status ' + res.status);
            const m = await res.json();

            const hero = document.getElementById('modal-hero');
            if (hero) hero.innerHTML = '<button class="modal-close" onclick="Modal.close()">✕</button>';

            const titleEl = document.getElementById('modal-title');
            if (titleEl) titleEl.textContent = m.title || '';

            const descEl = document.getElementById('modal-desc');
            if (descEl) descEl.textContent = m.description || '';

            document.getElementById('module-modal')?.classList.add('open');
            document.body.style.overflow = 'hidden';
            this.switchTab('materi');
        } catch(err) {
            console.error('Gagal buka modul:', err);
        }
    }
};

// ---- MODULES ----
const Modules = {
    allModules: [],

    async loadAll() {
        try {
            const res = await fetch('/api/modules');
            if (!res.ok) throw new Error('Status ' + res.status);
            this.allModules = await res.json();
            this.renderGrid('all-modules-grid', this.allModules);
            setTimeout(() => this.initScrollAnimation(), 100);
        } catch(err) {
            console.error('Gagal load modul:', err);
            const container = document.getElementById('all-modules-grid');
            if (container) container.innerHTML = `<p style="color:red;">Gagal memuat modul: ${err.message}</p>`;
        }
    },

    async loadHomePreview() {
        const container = document.getElementById('home-modules-preview');
        if (!container) return;
        try {
            const res = await fetch('/api/modules');
            const modules = await res.json();
            if (!modules || modules.length === 0) return;
            container.innerHTML = this.renderCard(modules[0]);
        } catch(err) {
            console.error('Gagal load preview:', err);
        }
    },

    renderCard(m) {
        return `
            <div style="width:320px;background:rgba(255,255,255,0.05);border-radius:16px;overflow:hidden;padding:12px;margin:16px;">
                <img src="${m.thumbnail || '/Foto/Jona1.jpeg'}" alt="${m.title || ''}"
                    style="width:100%;height:180px;object-fit:cover;border-radius:12px;display:block;"
                    onerror="this.style.display='none'">
                <h3 style="margin:12px 0 8px 0;">${m.title || 'Tanpa Judul'}</h3>
                <p style="font-size:14px;margin-bottom:12px;color:var(--text-muted);">${m.description || ''}</p>
                <button onclick="window.location.href='/prequiz/${m.id}'"
                    style="width:100%;padding:10px;background:var(--ocean-main);color:white;border:none;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;">
                    📖 Baca Modul
                </button>
            </div>`;
    },

    renderGrid(containerId, modules) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!modules || modules.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Belum ada modul.</p>';
            return;
        }
        container.innerHTML = modules.map(m => this.renderCard(m)).join('');
    },

    search(keyword) {
        const term = keyword.toLowerCase().trim();
        const filtered = term
            ? this.allModules.filter(m =>
                (m.title || '').toLowerCase().includes(term) ||
                (m.description || '').toLowerCase().includes(term))
            : this.allModules;

        const noResults = document.getElementById('no-results');
        if (filtered.length === 0) {
            document.getElementById('all-modules-grid').innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        if (noResults) noResults.style.display = 'none';
        this.renderGrid('all-modules-grid', filtered);
        setTimeout(() => this.initScrollAnimation(), 80);
    },

    initScrollAnimation() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal-card').forEach(el => obs.observe(el));
    }
};

// ---- UTILS ----
const Utils = {
    filterTips(kategori, btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        document.querySelectorAll('.tip-card').forEach(card => {
            card.style.display = (kategori === 'semua' || card.dataset.kategori === kategori) ? 'block' : 'none';
        });
    }
};

// ---- QUIZ (modal) ----
const Quiz = {
    async submitModalQuiz(moduleId) {
        try {
            const res = await fetch(`/api/quizzes/module/${moduleId}`);
            const quizzes = await res.json();
            let score = 0;
            quizzes.forEach(q => {
                const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
                if (selected && selected.value === q.answer) score++;
            });
            alert(`Nilai kamu: ${score}/${quizzes.length}`);
        } catch(err) {
            console.error('Quiz error:', err);
        }
    }
};


// INIT — dipanggil setelah semua object terdefinisi di atas

document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    Auth.init();
    Navigation.init();
    Modal.init();

    const path = window.location.pathname;
    if (path === '/' || path === '/homepage.html') {
        Modules.loadHomePreview();
    } else if (path === '/modules' || path === '/modules.html') {
        Modules.loadAll();
    }

    Modules.initScrollAnimation();
});


// GLOBAL
window.Theme      = Theme;
window.Auth       = Auth;
window.UI         = UI;
window.Navigation = Navigation;
window.Modal      = Modal;
window.Modules    = Modules;
window.Utils      = Utils;
window.Quiz       = Quiz;

window.toggleTheme     = () => Theme.toggle();
window.toggleMobileMenu = () => Navigation.toggleMobileMenu();
window.openAuth        = (tab) => UI.openAuth(tab);
window.closeAuth       = () => UI.closeAuth();
window.switchAuthTab   = (tab) => UI.switchAuthTab(tab);
window.doLogin         = () => UI.doLogin();
window.doSignup        = () => UI.doSignup();
window.closeModal      = () => Modal.close();
window.closeModalOutside = (e) => Modal.closeOnOutsideClick(e, 'module-modal');
window.switchTab       = (name, btn) => Modal.switchTab(name, btn);
window.switchTabById   = (name) => Modal.switchTab(name);
window.openModule      = (id) => Modal.openModule(id);
window.submitQuiz      = (moduleId) => Quiz.submitModalQuiz(moduleId);
window.filterTips      = (kategori, btn) => Utils.filterTips(kategori, btn);
window.searchModules   = (q) => Modules.search(q);