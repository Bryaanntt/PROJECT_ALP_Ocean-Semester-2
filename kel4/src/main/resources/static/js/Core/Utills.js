const Utils = {
    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },
    
    renderBlocks(content) {
        if (!content) return '<p style="color:var(--text-muted)">Konten belum tersedia.</p>';
        
        let blocks;
        try {
            blocks = JSON.parse(content);
            if (!Array.isArray(blocks)) throw new Error();
        } catch(e) {
            return content;
        }
        
        return blocks.map(b => {
            switch(b.type) {
                case 'heading':
                    return `<h3 style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:var(--ocean-light);margin:1.75rem 0 0.6rem;padding-bottom:0.4rem;border-bottom:1px solid rgba(56,189,248,0.15);">${this.escapeHtml(b.text)}</h3>`;
                case 'paragraph':
                    return `<p style="line-height:1.8;margin-bottom:0.9rem;color:var(--text-main);font-size:0.925rem;">${this.escapeHtml(b.text)}</p>`;
                case 'image':
                    return `<div style="border-radius:12px;overflow:hidden;margin:1.25rem 0;border:1px solid var(--card-border);">
                        <img src="${b.url || ''}" alt="${b.caption || ''}" style="width:100%;max-height:320px;object-fit:cover;display:block;" onerror="this.style.display='none'">
                        ${b.caption ? `<div style="padding:8px 14px;font-size:0.76rem;color:var(--text-muted);background:var(--input-bg);">${this.escapeHtml(b.caption)}</div>` : ''}
                    </div>`;
                default:
                    return b.text ? `<p style="line-height:1.8;margin-bottom:0.9rem;">${this.escapeHtml(b.text)}</p>` : '';
            }
        }).join('');
    },
    
    // Filter tips
    filterTips(kategori, btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.tip-card').forEach(card => {
            if (kategori === 'semua' || card.dataset.kategori === kategori) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
};

window.Utils = Utils;