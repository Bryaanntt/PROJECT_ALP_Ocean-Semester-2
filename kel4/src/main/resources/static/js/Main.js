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
            ? `<span style="font-size:0.85rem;color:var(--text-muted);margin-right:8px;">👤 ${this.currentUser.username}</span><button class="btn-outline" style="padding:7px 16px;font-size:0.82rem;" onclick="Auth.logout()">Keluar</button>`
            : `<button class="btn-primary" style="padding:8px 18px;font-size:0.85rem;" onclick="UI.openAuth('login')">Masuk / Daftar</button>`;
    },
    login() {
        const user = document.getElementById('login-username')?.value.trim();
        const pass = document.getElementById('login-password')?.value;
        const err  = document.getElementById('auth-error-login');
        if (!user || !pass) { if(err) err.textContent = 'Username dan password wajib diisi.'; return; }
        if (!this.registeredUsers[user] || this.registeredUsers[user] !== pass) { if(err) err.textContent = 'Username atau password salah.'; return; }
        this.currentUser = { username: user };
        sessionStorage.setItem('og_user', JSON.stringify(this.currentUser));
        UI.closeAuth(); this.updateNavUI();
    },
    signup() {
        const user = document.getElementById('signup-username')?.value.trim();
        const pass = document.getElementById('signup-password')?.value;
        const conf = document.getElementById('signup-confirm')?.value;
        const err  = document.getElementById('auth-error-signup');
        if (!user || !pass || !conf) { if(err) err.textContent = 'Semua kolom wajib diisi.'; return; }
        if (pass.length < 6) { if(err) err.textContent = 'Password minimal 6 karakter.'; return; }
        if (pass !== conf)   { if(err) err.textContent = 'Password tidak cocok.'; return; }
        if (this.registeredUsers[user]) { if(err) err.textContent = 'Username sudah digunakan.'; return; }
        this.registeredUsers[user] = pass;
        localStorage.setItem('og_users', JSON.stringify(this.registeredUsers));
        this.currentUser = { username: user };
        sessionStorage.setItem('og_user', JSON.stringify(this.currentUser));
        UI.closeAuth(); this.updateNavUI();
    },
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('og_user');
        this.updateNavUI();
    }
};

const UI = {
    openAuth(tab = 'login') {
        document.getElementById('auth-modal')?.classList.add('open');
        this.switchAuthTab(tab);
    },
    closeAuth() { document.getElementById('auth-modal')?.classList.remove('open'); },
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

const Modal = {
    init() {},
    close() {
        document.getElementById('module-modal')?.classList.remove('open');
        document.body.style.overflow = '';
    },
    closeModal() { this.close(); },
    closeOnOutsideClick(e, id) { if (e.target === document.getElementById(id)) this.close(); },
    switchTab(name, btn) {
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active'));
        if (btn) btn.classList.add('active');
        document.getElementById('tab-' + name)?.classList.add('active');
    }
};

const Utils = {
    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    },
    filterTips(kategori, btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        document.querySelectorAll('.tip-card').forEach(card => {
            card.style.display = (kategori === 'semua' || card.dataset.kategori === kategori) ? 'block' : 'none';
        });
    }
};

const API = {
    async getModules() {
        const res = await fetch('/api/modules');
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
    },
    async getQuizzes(moduleId) {
        const res = await fetch('/api/quizzes/module/' + moduleId);
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
    }
};

const AppState = {
    _modules: [],
    setModules(m) { this._modules = m; },
    getModules()  { return this._modules; }
};

const Modules = {
    async loadAll() {
        const container = document.getElementById('all-modules-grid');
        if (!container) return;
        try {
            const modules = await API.getModules();
            AppState.setModules(modules);
            if (!modules || modules.length === 0) {
                container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Belum ada modul.</p>';
                return;
            }
            container.innerHTML = modules.map(m => this.renderModuleCard(m)).join('');
            this.initScrollAnimation();
        } catch(err) {
            console.error('Gagal load modul:', err);
            container.innerHTML = '<p style="color:red;text-align:center;">Gagal memuat modul: ' + err.message + '</p>';
        }
    },

    async loadHomePreview() {
        const container = document.getElementById('home-modules-preview');
        if (!container) return;
        try {
            const modules = await API.getModules();
            AppState.setModules(modules);
            if (!modules || modules.length === 0) return;
            container.innerHTML = this.renderModuleCard(modules[0]);
        } catch(err) {
            console.error('Gagal load preview:', err);
        }
    },

    renderModuleCard(m) {
        return '<div class="module-card reveal-card" onclick="window.location.href=\'/prequiz/' + m.id + '\'" style="cursor:pointer;">'
            + '<div class="module-thumb" style="position:relative;height:200px;border-radius:16px 16px 0 0;overflow:hidden;">'
            + '<img src="' + (m.thumbnail || '/Foto/Jona4.jpg') + '" alt="' + Utils.escapeHtml(m.title) + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">'
            + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(10,22,40,0.7) 100%);"></div>'
            + '</div>'
            + '<div class="module-body" style="padding:1.25rem;">'
            + '<div class="module-title" style="font-weight:700;font-size:1.05rem;margin-bottom:0.5rem;">' + Utils.escapeHtml(m.title || 'Tanpa Judul') + '</div>'
            + '<div class="module-desc" style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem;line-height:1.5;">' + Utils.escapeHtml(m.description || '') + '</div>'
            + '<button class="btn-primary" style="font-size:0.82rem;padding:8px 16px;width:100%;justify-content:center;">📖 Buka Modul</button>'
            + '</div></div>';
    },

    search(keyword) {
        const term = keyword.toLowerCase().trim();
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
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal-card').forEach(el => obs.observe(el));
    }
};

const Quiz = {
    async submitModalQuiz(moduleId) {
        try {
            const quizzes = await API.getQuizzes(moduleId);
            let score = 0;
            quizzes.forEach(q => {
                const s = document.querySelector('input[name="q' + q.id + '"]:checked');
                if (s && s.value === q.answer) score++;
            });
            alert('Nilai kamu: ' + score + '/' + quizzes.length);
        } catch(err) { console.error('Quiz error:', err); }
    }
};

// INIT

document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    Auth.init();
    Modal.init();

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { Modal.close(); UI.closeAuth(); }
    });

    const path = window.location.pathname;
    if (path === '/') {
        Modules.loadHomePreview();
    } else if (path === '/modules') {
        Modules.loadAll();
    }

    Modules.initScrollAnimation();
});

// GLOBAL

window.Theme    = Theme;
window.Auth     = Auth;
window.UI       = UI;
window.Modal    = Modal;
window.Modules  = Modules;
window.Utils    = Utils;
window.API      = API;
window.AppState = AppState;
window.Quiz     = Quiz;

window.toggleTheme       = () => Theme.toggle();
window.toggleMobileMenu  = () => document.getElementById('nav-mobile')?.classList.toggle('open');
window.openAuth          = (tab) => UI.openAuth(tab);
window.closeAuth         = () => UI.closeAuth();
window.switchAuthTab     = (tab) => UI.switchAuthTab(tab);
window.doLogin           = () => UI.doLogin();
window.doSignup          = () => UI.doSignup();
window.closeModal        = () => Modal.close();
window.closeModalOutside = (e) => Modal.closeOnOutsideClick(e, 'module-modal');
window.switchTab         = (name, btn) => Modal.switchTab(name, btn);
window.switchTabById     = (name) => Modal.switchTab(name);
window.submitQuiz        = (moduleId) => Quiz.submitModalQuiz(moduleId);
window.filterTips        = (kategori, btn) => Utils.filterTips(kategori, btn);
window.searchModules     = (q) => Modules.search(q);