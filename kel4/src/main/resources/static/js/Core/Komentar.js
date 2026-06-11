// ================================================================
// Komentar.js — disesuaikan dengan backend com.ocean.kel4
// Endpoint:
//   Auth   : POST /api/auth/login  |  POST /api/auth/register
//   Comment: GET  /api/comments/module/{moduleId}
//            POST /api/comments/module/{moduleId}
// Auth     : HttpSession (cookie otomatis oleh browser)
// ================================================================

// ----------------------------------------------------------------
// AuthDB — login via Spring Session (cookie-based)
// ----------------------------------------------------------------
const AuthDB = {
    currentUser: null,   // { id, username, displayName }
    _storageKey: 'pm_user',

    async init() {
        // Coba restore dari sessionStorage (agar tidak hilang saat refresh)
        try {
            const saved = sessionStorage.getItem(this._storageKey);
            if (saved) this.currentUser = JSON.parse(saved);
        } catch (e) {}

        // Verifikasi ke backend apakah session masih valid
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data.loggedIn) {
                    // Session valid — update currentUser dari server
                    this.currentUser = {
                        username:    data.username,
                        displayName: data.displayName || data.username
                    };
                    sessionStorage.setItem(this._storageKey, JSON.stringify(this.currentUser));
                } else {
                    // Session expired
                    this.currentUser = null;
                    sessionStorage.removeItem(this._storageKey);
                }
            }
        } catch (e) {
            console.warn('AuthDB: /api/auth/me tidak tersedia, pakai cache lokal');
        }

        this._renderNav();
    },

    async login(username, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        // Backend pakai { sukses, pesan, username }
        if (!data.sukses) throw new Error(data.pesan || 'Login gagal');

        this.currentUser = {
            username:    data.username || username,
            displayName: data.displayName || data.username || username
        };
        sessionStorage.setItem(this._storageKey, JSON.stringify(this.currentUser));
        this._renderNav();
        return this.currentUser;
    },

    async register(username, password, displayName) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        // Backend pakai { sukses, pesan }
        if (!data.sukses) throw new Error(data.pesan || 'Registrasi gagal');

        // Setelah register, langsung login agar session terbentuk
        return await this.login(username, password);
    },

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {}
        this.currentUser = null;
        sessionStorage.removeItem(this._storageKey);
        this._renderNav();
        // Reload komentar agar form berubah ke "belum login"
        const moduleId = document.getElementById('module-data')?.dataset.moduleId;
        if (moduleId) await KomentarUI.loadKomentar(moduleId);
    },

    isLoggedIn() {
        return this.currentUser !== null;
    },

    _renderNav() {
        const area = document.getElementById('nav-auth-area');
        if (!area) return;
        if (this.currentUser) {
            area.innerHTML = `
                <span style="font-size:0.85rem;color:var(--text-muted);margin-right:8px;">
                    👤 ${this._escape(this.currentUser.displayName || this.currentUser.username)}
                </span>
                <button class="btn-outline" style="padding:7px 16px;font-size:0.82rem;"
                        onclick="AuthDB.logout()">Keluar</button>`;
        } else {
            area.innerHTML = `
                <button class="btn-primary" style="padding:8px 18px;font-size:0.85rem;"
                        onclick="KomentarUI.bukaModalLogin()">Masuk / Daftar</button>`;
        }
    },

    _escape(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
};


// ----------------------------------------------------------------
// KomentarUI — render komentar + modal login/daftar
// ----------------------------------------------------------------
const KomentarUI = {

    // ── Load & render semua komentar ──────────────────────────────
    async loadKomentar(moduleId) {
        const section = document.getElementById('komentar-section');
        if (!section) return;

        try {
            // ← path disesuaikan: /api/comments/module/{moduleId}
            const res = await fetch(`/api/comments/module/${moduleId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Status ' + res.status);
            const komentar = await res.json();

            section.innerHTML = this._renderForm(moduleId) + this._renderList(komentar, moduleId);

        } catch (err) {
            section.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:1rem;">
                Gagal memuat komentar: ${err.message}</p>`;
        }
    },

    // ── Form tulis komentar ───────────────────────────────────────
    _renderForm(moduleId) {
        if (!AuthDB.isLoggedIn()) {
            return `
            <div style="
                background:rgba(56,189,248,0.05);
                border:1px dashed rgba(56,189,248,0.3);
                border-radius:12px;padding:1.25rem;
                text-align:center;margin-bottom:1.5rem;
            ">
                <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:0.75rem;">
                    Masuk untuk ikut berdiskusi 👋
                </p>
                <button class="btn-primary" style="padding:8px 20px;font-size:0.85rem;"
                        onclick="KomentarUI.bukaModalLogin()">Masuk / Daftar</button>
            </div>`;
        }

        const user = AuthDB.currentUser;
        return `
        <div style="margin-bottom:1.75rem;">
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">
                Komentar sebagai <strong style="color:var(--ocean-light);">
                ${AuthDB._escape(user.displayName || user.username)}</strong>
            </div>
            <textarea id="komentar-input" placeholder="Tulis komentar atau pertanyaanmu..."
                style="
                    width:100%;min-height:90px;padding:0.85rem 1rem;
                    background:var(--input-bg);border:1px solid var(--card-border);
                    border-radius:10px;color:var(--text-main);font-size:0.875rem;
                    font-family:inherit;resize:vertical;
                    transition:border-color 0.2s;box-sizing:border-box;
                "
                onfocus="this.style.borderColor='var(--ocean-main)'"
                onblur="this.style.borderColor='var(--card-border)'"
            ></textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:0.6rem;">
                <button class="btn-primary" style="padding:8px 20px;font-size:0.85rem;"
                        onclick="KomentarUI.kirimKomentar(${moduleId})">
                    💬 Kirim
                </button>
            </div>
        </div>`;
    },

    // ── List komentar ─────────────────────────────────────────────
    _renderList(komentar, moduleId) {
        if (!komentar || komentar.length === 0) {
            return `
            <div style="text-align:center;padding:2rem 1rem;color:var(--text-muted);">
                <div style="font-size:2rem;margin-bottom:0.5rem;">🌊</div>
                <p style="font-size:0.875rem;">Belum ada komentar. Jadilah yang pertama!</p>
            </div>`;
        }
        return komentar.map(k => this._renderCard(k, moduleId)).join('');
    },

    _renderCard(k, moduleId) {
        const isOwner = AuthDB.isLoggedIn() && AuthDB.currentUser.username === k.username;
        // Backend mengembalikan createdAt sudah diformat ("dd MMM yyyy HH:mm")
        const waktu   = k.createdAt || '';
        const nama    = k.displayName || k.username || '?';
        const inisial = nama[0].toUpperCase();

        return `
        <div id="komentar-${k.id}" style="
            display:flex;gap:0.85rem;margin-bottom:1.25rem;
            padding-bottom:1.25rem;border-bottom:1px solid var(--card-border);
        ">
            <div style="
                width:36px;height:36px;border-radius:50%;flex-shrink:0;
                background:linear-gradient(135deg,var(--ocean-main),var(--ocean-light));
                display:flex;align-items:center;justify-content:center;
                font-weight:700;font-size:0.85rem;color:#fff;
            ">${AuthDB._escape(inisial)}</div>

            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.3rem;flex-wrap:wrap;">
                    <span style="font-weight:600;font-size:0.875rem;">
                        ${AuthDB._escape(nama)}</span>
                    <span style="font-size:0.75rem;color:var(--text-muted);">${AuthDB._escape(waktu)}</span>
                    ${isOwner ? `
                    <button onclick="KomentarUI.hapusKomentar(${k.id}, ${moduleId})"
                        style="
                            margin-left:auto;background:none;border:none;cursor:pointer;
                            color:var(--text-muted);font-size:0.75rem;padding:2px 6px;
                            border-radius:4px;transition:color 0.2s;
                        "
                        onmouseover="this.style.color='#f87171'"
                        onmouseout="this.style.color='var(--text-muted)'"
                    >🗑 Hapus</button>` : ''}
                </div>
                <p style="
                    font-size:0.875rem;line-height:1.6;
                    color:var(--text-main);margin:0;word-break:break-word;
                ">${AuthDB._escape(k.content)}</p>
            </div>
        </div>`;
    },

    // ── Kirim komentar ────────────────────────────────────────────
    async kirimKomentar(moduleId) {
        if (!AuthDB.isLoggedIn()) { this.bukaModalLogin(); return; }

        const input   = document.getElementById('komentar-input');
        const content = input?.value.trim();
        if (!content) { this._toast('Komentar tidak boleh kosong', 'error'); return; }

        try {
            // ← POST /api/comments/module/{moduleId} — session otomatis dikirim via cookie
            const res = await fetch(`/api/comments/module/${moduleId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content })
            });

            const data = await res.json();

            // Backend mengembalikan { sukses, pesan }
            if (!res.ok || data.sukses === false) {
                throw new Error(data.pesan || data.error || 'Gagal kirim');
            }

            input.value = '';
            await this.loadKomentar(moduleId);
            this._toast('Komentar terkirim! 🌊', 'success');

        } catch (err) {
            this._toast('Gagal: ' + err.message, 'error');
        }
    },

    // ── Hapus komentar (opsional — tambahkan endpoint DELETE di backend) ──
    async hapusKomentar(commentId, moduleId) {
        if (!AuthDB.isLoggedIn()) return;
        if (!confirm('Hapus komentar ini?')) return;
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Gagal hapus');
            await this.loadKomentar(moduleId);
            this._toast('Komentar dihapus', 'success');
        } catch (err) {
            this._toast('Gagal hapus: ' + err.message, 'error');
        }
    },

    // ── Modal Login / Daftar ──────────────────────────────────────
    bukaModalLogin() {
        if (!document.getElementById('auth-modal-km')) {
            document.body.insertAdjacentHTML('beforeend', this._modalHTML());
        }
        document.getElementById('auth-modal-km').classList.add('open');
        this.switchTab('login');
        document.getElementById('km-err').textContent = '';
    },

    tutupModal() {
        document.getElementById('auth-modal-km')?.classList.remove('open');
    },

    switchTab(tab) {
        ['login','daftar'].forEach(t => {
            document.getElementById(`km-panel-${t}`).style.display = t === tab ? 'block' : 'none';
            document.getElementById(`km-tab-${t}`).classList.toggle('active', t === tab);
        });
        document.getElementById('km-err').textContent = '';
    },

    async doLogin() {
        const username = document.getElementById('km-username').value.trim();
        const password = document.getElementById('km-password').value;
        const errEl    = document.getElementById('km-err');
        if (!username || !password) { errEl.textContent = 'Isi username dan password'; return; }
        try {
            await AuthDB.login(username, password);
            this.tutupModal();
            const moduleId = document.getElementById('module-data')?.dataset.moduleId;
            if (moduleId) await this.loadKomentar(moduleId);
            this._toast('Selamat datang, ' + AuthDB.currentUser.displayName + '! 👋', 'success');
        } catch (err) {
            errEl.textContent = err.message;
        }
    },

    async doDaftar() {
        const username    = document.getElementById('km-daftar-username').value.trim();
        const displayName = document.getElementById('km-daftar-nama').value.trim();
        const password    = document.getElementById('km-daftar-password').value;
        const confirm     = document.getElementById('km-daftar-confirm').value;
        const errEl       = document.getElementById('km-err');
        if (password !== confirm) { errEl.textContent = 'Password tidak cocok'; return; }
        try {
            await AuthDB.register(username, password, displayName || username);
            this.tutupModal();
            const moduleId = document.getElementById('module-data')?.dataset.moduleId;
            if (moduleId) await this.loadKomentar(moduleId);
            this._toast('Akun dibuat! Selamat datang 🌊', 'success');
        } catch (err) {
            errEl.textContent = err.message;
        }
    },

    _modalHTML() {
        return `
        <div id="auth-modal-km" onclick="if(event.target===this)KomentarUI.tutupModal()" style="
            position:fixed;inset:0;background:rgba(0,0,0,0.65);
            display:none;align-items:center;justify-content:center;
            z-index:9999;padding:1rem;
        ">
        <style>
            #auth-modal-km.open{display:flex!important}
            #auth-modal-km .km-input{
                width:100%;padding:.75rem 1rem;margin-bottom:.85rem;
                background:var(--input-bg);border:1px solid var(--card-border);
                border-radius:8px;color:var(--text-main);font-size:.875rem;
                font-family:inherit;box-sizing:border-box;transition:border-color .2s;
            }
            #auth-modal-km .km-input:focus{outline:none;border-color:var(--ocean-main)}
            #auth-modal-km .km-tab{
                flex:1;padding:.6rem;background:none;border:none;
                border-bottom:2px solid transparent;color:var(--text-muted);
                font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;
            }
            #auth-modal-km .km-tab.active{color:var(--ocean-light);border-bottom-color:var(--ocean-main)}
        </style>
        <div style="
            background:var(--card-bg);border:1px solid var(--card-border);
            border-radius:16px;padding:2rem;width:100%;max-width:380px;position:relative;
        ">
            <button onclick="KomentarUI.tutupModal()" style="
                position:absolute;top:1rem;right:1rem;
                background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-muted);
            ">✕</button>
            <h3 style="font-family:'Syne',sans-serif;font-weight:700;margin-bottom:1.25rem;font-size:1.05rem;">
                🌊 Gabung Diskusi</h3>
            <div style="display:flex;border-bottom:1px solid var(--card-border);margin-bottom:1.25rem;">
                <button id="km-tab-login"  class="km-tab active" onclick="KomentarUI.switchTab('login')">Masuk</button>
                <button id="km-tab-daftar" class="km-tab"        onclick="KomentarUI.switchTab('daftar')">Daftar</button>
            </div>
            <p id="km-err" style="color:#f87171;font-size:.8rem;margin-bottom:.5rem;min-height:1rem;"></p>

            <div id="km-panel-login">
                <input id="km-username" class="km-input" type="text"     placeholder="Username" autocomplete="username">
                <input id="km-password" class="km-input" type="password" placeholder="Password" autocomplete="current-password">
                <button class="btn-primary" style="width:100%;padding:.75rem;font-size:.9rem;"
                        onclick="KomentarUI.doLogin()">Masuk</button>
            </div>

            <div id="km-panel-daftar" style="display:none;">
                <input id="km-daftar-username" class="km-input" type="text"     placeholder="Username (min. 3 karakter)" autocomplete="username">
                <input id="km-daftar-nama"     class="km-input" type="text"     placeholder="Nama tampilan (opsional)">
                <input id="km-daftar-password" class="km-input" type="password" placeholder="Password (min. 6 karakter)" autocomplete="new-password">
                <input id="km-daftar-confirm"  class="km-input" type="password" placeholder="Konfirmasi password"        autocomplete="new-password">
                <button class="btn-primary" style="width:100%;padding:.75rem;font-size:.9rem;"
                        onclick="KomentarUI.doDaftar()">Buat Akun</button>
            </div>
        </div>
        </div>`;
    },

    _toast(msg, type = 'info') {
        const el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText = `
            position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;
            padding:.75rem 1.25rem;border-radius:10px;font-size:.875rem;
            font-weight:600;color:#fff;pointer-events:none;
            background:${type === 'error' ? '#ef4444' : '#22c55e'};
            box-shadow:0 4px 20px rgba(0,0,0,.3);animation:slideUp .3s ease;
        `;
        if (!document.getElementById('km-toast-style')) {
            const s = document.createElement('style');
            s.id = 'km-toast-style';
            s.textContent = '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
            document.head.appendChild(s);
        }
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }
};

window.AuthDB     = AuthDB;
window.KomentarUI = KomentarUI;