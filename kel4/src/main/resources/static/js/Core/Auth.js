const Auth = {
    currentUser: null,
    registeredUsers: {},
    
    init() {
        try {
            this.currentUser = JSON.parse(sessionStorage.getItem('og_user'));
            this.registeredUsers = JSON.parse(localStorage.getItem('og_users') || '{}');
        } catch(e) {
            console.error('Auth init error:', e);
        }
    },
    
    login(username, password) {
        if (!username || !password) {
            throw new Error('Username dan password wajib diisi');
        }
        if (!this.registeredUsers[username] || this.registeredUsers[username] !== password) {
            throw new Error('Username atau password salah');
        }
        this.currentUser = { username };
        sessionStorage.setItem('og_user', JSON.stringify(this.currentUser));
        return this.currentUser;
    },
    
    signup(username, password, confirm) {
        if (!username || !password || !confirm) {
            throw new Error('Semua kolom wajib diisi');
        }
        if (password.length < 6) {
            throw new Error('Password minimal 6 karakter');
        }
        if (password !== confirm) {
            throw new Error('Password tidak cocok');
        }
        if (this.registeredUsers[username]) {
            throw new Error('Username sudah digunakan');
        }
        this.registeredUsers[username] = password;
        localStorage.setItem('og_users', JSON.stringify(this.registeredUsers));
        this.currentUser = { username };
        sessionStorage.setItem('og_user', JSON.stringify(this.currentUser));
        return this.currentUser;
    },
    
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('og_user');
        this.updateNavUI();
    },
    
    isAuthenticated() {
        return this.currentUser !== null;
    },
    
    getUser() {
        return this.currentUser;
    },
    
    updateNavUI() {
        const area = document.getElementById('nav-auth-area');
        if (!area) return;
        
        area.innerHTML = this.currentUser
            ? `<span style="font-size:0.85rem;color:var(--text-muted);margin-right:8px;">👤 ${this.currentUser.username}</span>
            <button class="btn-outline" style="padding:7px 16px;font-size:0.82rem;" onclick="Auth.logout()">Keluar</button>`
            : `<button class="btn-primary" style="padding:8px 18px;font-size:0.85rem;" onclick="UI.openAuth('login')">Masuk / Daftar</button>`;
    }
};

// Initialize Auth on load
Auth.init();

// Export
window.Auth = Auth;