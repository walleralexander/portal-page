// =============================================================================
// Portal Page - Enhanced Edition (Phase 2)
// =============================================================================

// ---- Global State -----------------------------------------------------------
let globalConfig = null;
let rssAutoRefreshTimer = null;
const rssHealthStatus = {};       // { url: { ok, fails, lastLoad, avgMs } }

// ---- Cache Manager ----------------------------------------------------------
// Granular cache that can be disabled fully or per-type via config.
//
// links.yaml cache section:
//   cache:
//     enabled: true          # master switch – false turns off ALL caching
//     rss_enabled: true      # RSS feed result caching
//     rss_duration: 300      # seconds
//     config_enabled: true   # YAML config caching
//     config_duration: 60    # seconds
//
// For development set cache.enabled: false to always fetch fresh data.
// Or disable only rss caching with cache.rss_enabled: false while keeping
// other caches active.

const CacheManager = {
    _resolveEnabled(type) {
        const c = globalConfig?.cache;
        if (!c || c.enabled === false) return false;
        if (type && c[`${type}_enabled`] === false) return false;
        return true;
    },

    _ttl(type) {
        const c = globalConfig?.cache;
        const key = `${type}_duration`;
        return ((c && c[key]) || 300) * 1000;
    },

    get(key, type) {
        if (!this._resolveEnabled(type)) {
            console.log(`[Cache] SKIP read (${type} caching disabled): ${key}`);
            return null;
        }
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            const age = Date.now() - entry.timestamp;
            if (age > this._ttl(type)) {
                console.log(`[Cache] EXPIRED (${(age/1000).toFixed(0)}s > ${(this._ttl(type)/1000)}s): ${key}`);
                return null;
            }
            console.log(`[Cache] HIT (${(age/1000).toFixed(0)}s old): ${key}`);
            return entry.data;
        } catch (e) {
            console.warn('[Cache] Read error:', e);
            return null;
        }
    },

    set(key, data, type) {
        if (!this._resolveEnabled(type)) {
            console.log(`[Cache] SKIP write (${type} caching disabled): ${key}`);
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
            console.log(`[Cache] STORED: ${key}`);
        } catch (e) {
            console.warn('[Cache] Write error:', e);
        }
    },

    /** Return stale data regardless of TTL (used as fallback on network error) */
    getStale(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw).data;
        } catch { return null; }
    },

    clear(pattern) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!pattern || k.startsWith(pattern)) keys.push(k);
        }
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`[Cache] Cleared ${keys.length} entries${pattern ? ` matching "${pattern}"` : ''}`);
    },

    /** Human-readable summary for dev mode badge */
    summary() {
        const c = globalConfig?.cache;
        if (!c || c.enabled === false) return 'ALL CACHING DISABLED';
        const parts = [];
        if (c.rss_enabled === false) parts.push('rss:off');
        else parts.push(`rss:${c.rss_duration || 300}s`);
        if (c.config_enabled === false) parts.push('config:off');
        else parts.push(`config:${c.config_duration || 60}s`);
        return parts.join(' | ');
    }
};

// ---- Rate Limiter -----------------------------------------------------------
const RateLimiter = {
    _requests: {},

    isAllowed(key, max, windowSec) {
        const now = Date.now();
        const windowMs = windowSec * 1000;
        if (!this._requests[key]) this._requests[key] = [];
        this._requests[key] = this._requests[key].filter(t => t > now - windowMs);
        if (this._requests[key].length >= max) {
            console.warn(`[RateLimit] Blocked: ${key} (${max}/${windowSec}s)`);
            return false;
        }
        this._requests[key].push(now);
        return true;
    }
};

// ---- Config Validator -------------------------------------------------------
const ConfigValidator = {
    validate(config) {
        const errors = [];
        const warnings = [];

        if (!config) { errors.push('Config is empty'); return { ok: false, errors, warnings }; }
        if (!config.categories || !Array.isArray(config.categories)) {
            errors.push('Missing or invalid "categories" array');
        } else {
            config.categories.forEach((cat, i) => {
                if (!cat.name) errors.push(`Category #${i + 1}: missing "name"`);
                if (!cat.links && !cat.rss_feed) warnings.push(`Category "${cat.name || i + 1}": no links or rss_feed`);
                if (cat.rss_feed && !isValidURL(cat.rss_feed)) errors.push(`Category "${cat.name}": invalid rss_feed URL`);
                cat.links?.forEach((link, j) => {
                    if (!link.url) errors.push(`Category "${cat.name}" link #${j + 1}: missing URL`);
                    if (!link.title) warnings.push(`Category "${cat.name}" link #${j + 1}: missing title`);
                });
            });
        }
        if (config.rss_feed && !isValidURL(config.rss_feed)) {
            errors.push('Invalid main rss_feed URL');
        }
        return { ok: errors.length === 0, errors, warnings };
    }
};

function isValidURL(str) {
    try { new URL(str); return true; } catch { return false; }
}

// ---- Toast / Notification System --------------------------------------------
// Supports stacking and action buttons.  Types: info, success, error, warning
const Toast = {
    _container: null,

    _ensureContainer() {
        if (this._container) return;
        this._container = document.createElement('div');
        this._container.className = 'toast-container';
        document.body.appendChild(this._container);
    },

    show(message, type = 'info', duration = 3000, actions) {
        this._ensureContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const msgSpan = document.createElement('span');
        msgSpan.className = 'toast-message';
        msgSpan.textContent = message;
        toast.appendChild(msgSpan);

        if (actions && actions.length) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'toast-actions';
            actions.forEach(({ label, onClick }) => {
                const btn = document.createElement('button');
                btn.className = 'toast-action-btn';
                btn.textContent = label;
                btn.onclick = () => { onClick(); this._dismiss(toast); };
                actionsDiv.appendChild(btn);
            });
            toast.appendChild(actionsDiv);
        }

        // Dismiss button
        const close = document.createElement('button');
        close.className = 'toast-close';
        close.innerHTML = '&times;';
        close.onclick = () => this._dismiss(toast);
        toast.appendChild(close);

        this._container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        if (duration > 0) {
            setTimeout(() => this._dismiss(toast), duration);
        }
        return toast;
    },

    _dismiss(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
    }
};

// Keep backward compat with Phase 1 callers
function showStatus(message, type = 'info', duration = 3000) {
    Toast.show(message, type, duration);
}

// ---- Dev Mode Badge ---------------------------------------------------------
function renderDevBadge() {
    const c = globalConfig?.cache;
    const isDev = c && c.enabled === false;
    const hasPartialOff = c && c.enabled !== false && (c.rss_enabled === false || c.config_enabled === false);

    // Remove old badge
    document.getElementById('dev-badge')?.remove();

    if (!isDev && !hasPartialOff) return;

    const badge = document.createElement('div');
    badge.id = 'dev-badge';
    badge.className = isDev ? 'dev-badge dev-badge-full' : 'dev-badge dev-badge-partial';
    badge.title = CacheManager.summary();
    badge.innerHTML = isDev
        ? '🛠 DEV – Cache OFF'
        : `🛠 DEV – ${CacheManager.summary()}`;
    document.body.appendChild(badge);
}

// ---- Dark Mode Toggle -------------------------------------------------------
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    toggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// ---- Date / Time Display ----------------------------------------------------
function updateDateTime() {
    const el = document.getElementById('datetime');
    const now = new Date();
    el.textContent = now.toLocaleDateString('de-DE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function initDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// ---- Icon Map (unchanged from Phase 1) --------------------------------------
const icons = {
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'cloud': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    'globe': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    'www': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    'website': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    'flag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    'calculator': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>',
    'code': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    'help-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'book': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    'edit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    'terminal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    'message-square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'play-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    'calendar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    'clipboard': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
    'link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    'star': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'folder': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    'upload': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    'external-link': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    'rss': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>',
    'database': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>',
    'server': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    'lock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    'unlock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    'key': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>',
    'bell': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    'contact': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect width="18" height="18" x="3" y="4" rx="2"/><circle cx="12" cy="10" r="2"/><line x1="8" x2="8" y1="2" y2="4"/><line x1="16" x2="16" y1="2" y2="4"/></svg>',
    'flag-at': '<svg viewBox="0 0 24 16"><rect width="24" height="16" fill="#ed2939"/><rect y="5.33" width="24" height="5.33" fill="#fff"/></svg>',
    'flag-de': '<svg viewBox="0 0 24 16"><rect width="24" height="5.33" fill="#000"/><rect y="5.33" width="24" height="5.33" fill="#dd0000"/><rect y="10.66" width="24" height="5.34" fill="#ffcc00"/></svg>',
    'flag-eu': '<svg viewBox="0 0 24 16"><rect width="24" height="16" fill="#003399"/><g fill="#ffcc00"><circle cx="12" cy="3" r="1"/><circle cx="12" cy="13" r="1"/><circle cx="7.1" cy="4.5" r="1"/><circle cx="16.9" cy="4.5" r="1"/><circle cx="7.1" cy="11.5" r="1"/><circle cx="16.9" cy="11.5" r="1"/><circle cx="4.5" cy="8" r="1"/><circle cx="19.5" cy="8" r="1"/><circle cx="5.5" cy="5.5" r="1"/><circle cx="18.5" cy="5.5" r="1"/><circle cx="5.5" cy="10.5" r="1"/><circle cx="18.5" cy="10.5" r="1"/></g></svg>',
    'flag-ch': '<svg viewBox="0 0 24 16"><rect width="24" height="16" fill="#ff0000"/><rect x="10" y="3" width="4" height="10" fill="#fff"/><rect x="7" y="6" width="10" height="4" fill="#fff"/></svg>',
    'flag-wien': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#fff"/></svg>',
    'flag-noe': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#1e4785"/><rect y="8" width="24" height="8" fill="#ffd735"/></svg>',
    'flag-ooe': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#ed2939"/></svg>',
    'flag-stmk': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#00873e"/></svg>',
    'flag-ktn': '<svg viewBox="0 0 24 16"><rect width="24" height="5.33" fill="#ffd735"/><rect y="5.33" width="24" height="5.33" fill="#ed2939"/><rect y="10.66" width="24" height="5.34" fill="#fff"/></svg>',
    'flag-sbg': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#fff"/></svg>',
    'flag-tirol': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#ed2939"/></svg>',
    'flag-vbg': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#fff"/></svg>',
    'flag-bgld': '<svg viewBox="0 0 24 16"><rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#ffd735"/></svg>'
};

function getIcon(name) { return icons[name] || icons['link']; }

// ---- Config Loader ----------------------------------------------------------
async function loadConfig() {
    // Try config cache first
    const cached = CacheManager.get('portal_config', 'config');
    if (cached) {
        globalConfig = applyConfigDefaults(cached);
        return globalConfig;
    }

    try {
        const response = await fetch('links.yaml');
        const yamlText = await response.text();
        const config = jsyaml.load(yamlText);

        const final = applyConfigDefaults(config);
        globalConfig = final;

        // Validate
        const result = ConfigValidator.validate(final);
        if (!result.ok) {
            result.errors.forEach(e => console.error('[Config]', e));
            Toast.show(`Konfigurationsfehler: ${result.errors[0]}`, 'error', 5000);
        }
        result.warnings.forEach(w => console.warn('[Config]', w));

        // Cache (needs globalConfig set first so CacheManager can read settings)
        CacheManager.set('portal_config', config, 'config');

        return final;
    } catch (error) {
        console.error('Error loading config:', error);

        // Fallback to stale cache
        const stale = CacheManager.getStale('portal_config');
        if (stale) {
            Toast.show('Config-Ladung fehlgeschlagen – verwende zwischengespeicherte Version', 'warning', 4000);
            globalConfig = applyConfigDefaults(stale);
            return globalConfig;
        }
        return null;
    }
}

function applyConfigDefaults(config) {
    config.request_timeout = config.request_timeout || 10;
    config.max_retries = config.max_retries || 3;
    config.rss_refresh_interval = config.rss_refresh_interval || 0; // 0 = off
    config.features = config.features || {};
    config.features.search_enabled  = config.features.search_enabled  ?? true;
    config.features.keyboard_shortcuts = config.features.keyboard_shortcuts ?? true;
    config.features.analytics_enabled = config.features.analytics_enabled ?? false;

    // Cache defaults – backward compat with Phase 1 cache_duration field
    if (!config.cache) {
        config.cache = {
            enabled: true,
            rss_enabled: true,
            rss_duration: config.cache_duration || 300,
            config_enabled: true,
            config_duration: 60
        };
    } else {
        config.cache.enabled = config.cache.enabled ?? true;
        config.cache.rss_enabled = config.cache.rss_enabled ?? true;
        config.cache.rss_duration = config.cache.rss_duration ?? config.cache_duration ?? 300;
        config.cache.config_enabled = config.cache.config_enabled ?? true;
        config.cache.config_duration = config.cache.config_duration ?? 60;
    }
    return config;
}

// ---- RSS Fetching with retry + rate-limit -----------------------------------
async function fetchWithRetry(url, opts = {}, retries) {
    retries = retries ?? (globalConfig?.max_retries || 3);
    const timeout = (globalConfig?.request_timeout || 10) * 1000;

    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
            const res = await fetch(url, { ...opts, signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res;
        } catch (err) {
            clearTimeout(timer);
            const isLast = attempt === retries;
            if (isLast) throw err;
            const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            console.warn(`[Fetch] Attempt ${attempt}/${retries} failed, retry in ${backoff}ms`, err.message);
            await new Promise(r => setTimeout(r, backoff));
        }
    }
}

async function fetchRSSItems(feedUrl, maxItems = 5) {
    const cacheKey = `rss_cache_${feedUrl}`;

    // Cache check
    const cached = CacheManager.get(cacheKey, 'rss');
    if (cached) return cached.slice(0, maxItems);

    // Rate limit: max 5 requests per 60 s per feed
    if (!RateLimiter.isAllowed(feedUrl, 5, 60)) {
        Toast.show('Zu viele Anfragen – bitte kurz warten', 'warning', 3000);
        const stale = CacheManager.getStale(cacheKey);
        return stale ? stale.slice(0, maxItems) : [];
    }

    const t0 = performance.now();
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetchWithRetry(proxyUrl);
        const data = await response.json();

        if (!data.contents) return [];

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');
        if (xml.querySelector('parsererror')) return [];

        const rssItems = Array.from(xml.querySelectorAll('item')).map(item => ({
            title: item.querySelector('title')?.textContent || 'Untitled',
            url:   item.querySelector('link')?.textContent || '#',
            pubDate: item.querySelector('pubDate')?.textContent
        }));

        CacheManager.set(cacheKey, rssItems, 'rss');

        // Track health
        const elapsed = performance.now() - t0;
        updateRSSHealth(feedUrl, true, elapsed);

        return rssItems.slice(0, maxItems);
    } catch (error) {
        console.error('Error fetching RSS:', error);
        updateRSSHealth(feedUrl, false, 0);

        // Stale fallback
        const stale = CacheManager.getStale(cacheKey);
        if (stale) {
            console.log('[RSS] Using stale cache as fallback for:', feedUrl);
            Toast.show('RSS: Verwende ältere zwischengespeicherte Daten', 'warning', 3000);
            return stale.slice(0, maxItems);
        }
        return [];
    }
}

function updateRSSHealth(url, ok, ms) {
    if (!rssHealthStatus[url]) rssHealthStatus[url] = { ok: true, fails: 0, lastLoad: 0, avgMs: 0, count: 0 };
    const h = rssHealthStatus[url];
    h.ok = ok;
    h.lastLoad = Date.now();
    if (ok) {
        h.fails = 0;
        h.count++;
        h.avgMs = h.avgMs ? (h.avgMs * (h.count - 1) + ms) / h.count : ms;
    } else {
        h.fails++;
    }
}

// ---- Skeleton Loader --------------------------------------------------------
function showSkeleton(container, count = 3) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'skeleton skeleton-card';
        container.appendChild(s);
    }
}

// ---- Render Helpers ---------------------------------------------------------
function renderMessage(message) {
    const messageText = document.getElementById('message-text');
    const messageBanner = document.getElementById('message-banner');
    if (message && message.trim()) {
        messageText.textContent = message;
        messageBanner.style.display = 'block';
    } else {
        messageBanner.style.display = 'none';
    }
}

function createLinkCard(link) {
    const a = document.createElement('a');
    a.className = 'link-card';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'link-icon';
    iconSpan.innerHTML = getIcon(link.icon || 'rss');

    const titleSpan = document.createElement('span');
    titleSpan.className = 'link-title';
    titleSpan.textContent = link.title;

    if (link.pubDate) {
        const dateStr = new Date(link.pubDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
        titleSpan.innerHTML = `${link.title}<span class="link-date">${dateStr}</span>`;
    }

    a.appendChild(iconSpan);
    a.appendChild(titleSpan);
    return a;
}

// ---- Lazy-load RSS Categories with IntersectionObserver ---------------------
const pendingRSSCategories = new Map();   // element -> { feedUrl, items, icon }

function setupLazyRSS() {
    if (!('IntersectionObserver' in window)) return; // fallback: already loaded eagerly
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const meta = pendingRSSCategories.get(el);
            if (!meta) return;
            pendingRSSCategories.delete(el);
            observer.unobserve(el);
            loadRSSCategory(el, meta);
        });
    }, { rootMargin: '200px' });

    pendingRSSCategories.forEach((meta, el) => observer.observe(el));
}

async function loadRSSCategory(linksGrid, { feedUrl, items, icon }) {
    showSkeleton(linksGrid, items);
    try {
        const rssItems = await fetchRSSItems(feedUrl, items);
        linksGrid.innerHTML = '';
        if (rssItems.length === 0) {
            linksGrid.innerHTML = '<span class="error-text">Keine Artikel gefunden</span>';
        } else {
            rssItems.forEach(item => {
                item.icon = icon;
                linksGrid.appendChild(createLinkCard(item));
            });
        }
    } catch (error) {
        console.error('RSS category load error:', error);
        linksGrid.innerHTML = '<span class="error-text">Fehler beim Laden</span>';
    }
}

// ---- Render Links -----------------------------------------------------------
async function renderLinks(categories) {
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    pendingRSSCategories.clear();

    if (!categories || categories.length === 0) {
        container.innerHTML = '<p class="error">No links configured</p>';
        return;
    }

    for (const category of categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        const titleEl = document.createElement('h2');
        titleEl.className = 'category-title';
        titleEl.textContent = category.name;
        categoryDiv.appendChild(titleEl);

        const linksGrid = document.createElement('div');
        linksGrid.className = 'links-grid';

        if (category.rss_feed) {
            showSkeleton(linksGrid, category.rss_items || 5);
            categoryDiv.appendChild(linksGrid);
            container.appendChild(categoryDiv);

            // Register for lazy loading
            pendingRSSCategories.set(linksGrid, {
                feedUrl: category.rss_feed,
                items: category.rss_items || 5,
                icon: category.rss_icon || 'rss'
            });
        } else if (category.links) {
            category.links.forEach(link => linksGrid.appendChild(createLinkCard(link)));
            categoryDiv.appendChild(linksGrid);
            container.appendChild(categoryDiv);
        }
    }

    // Kick off lazy loading
    setupLazyRSS();
}

// ---- Sidebar RSS Feed -------------------------------------------------------
async function loadRSSFeed(feedUrl, maxItems = 5) {
    const container = document.getElementById('rss-container');
    if (!feedUrl) {
        container.innerHTML = '<p class="error">No RSS feed configured</p>';
        return;
    }

    showSkeleton(container, maxItems);

    try {
        const rssItems = await fetchRSSItems(feedUrl, maxItems);

        if (rssItems.length === 0) {
            container.innerHTML = '<p class="error">No items in feed</p>';
            return;
        }

        container.innerHTML = '';
        rssItems.forEach(rssItem => {
            const title = rssItem.title;
            const link  = rssItem.url;
            const pubDate = rssItem.pubDate;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'rss-item';

            const titleEl = document.createElement('h3');
            titleEl.className = 'rss-item-title';
            const linkEl = document.createElement('a');
            linkEl.href = link;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            linkEl.textContent = title;
            titleEl.appendChild(linkEl);
            itemDiv.appendChild(titleEl);

            if (pubDate) {
                const dateEl = document.createElement('p');
                dateEl.className = 'rss-item-date';
                dateEl.textContent = new Date(pubDate).toLocaleDateString('de-DE', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
                itemDiv.appendChild(dateEl);
            }

            container.appendChild(itemDiv);
        });

        Toast.show(`RSS: ${rssItems.length} Nachrichten geladen`, 'success', 2000);
    } catch (error) {
        console.error('Error loading RSS feed:', error);
        container.innerHTML = '<p class="error">RSS Feed konnte nicht geladen werden.</p>';
        Toast.show('RSS: Fehler beim Laden', 'error', 4000, [
            { label: 'Erneut versuchen', onClick: () => loadRSSFeed(feedUrl, maxItems) }
        ]);
    }
}

// ---- RSS Auto-Refresh -------------------------------------------------------
function startAutoRefresh() {
    const intervalSec = globalConfig?.rss_refresh_interval;
    if (!intervalSec || intervalSec <= 0) return;

    if (rssAutoRefreshTimer) clearInterval(rssAutoRefreshTimer);
    rssAutoRefreshTimer = setInterval(() => {
        console.log('[AutoRefresh] Refreshing RSS feeds…');
        // Clear RSS cache to force fresh fetch
        CacheManager.clear('rss_cache_');
        loadRSSFeed(globalConfig.rss_feed, globalConfig.rss_items || 5);
        renderLinks(globalConfig.categories);
        Toast.show('RSS-Feeds automatisch aktualisiert', 'info', 2000);
    }, intervalSec * 1000);

    console.log(`[AutoRefresh] Started – interval ${intervalSec}s`);
}

// ---- Pull to Refresh (mobile) ----------------------------------------------
function initPullToRefresh() {
    let startY = 0;
    let pulling = false;
    let indicator = null;

    document.addEventListener('touchstart', e => {
        if (window.scrollY === 0) {
            startY = e.touches[0].pageY;
            pulling = true;
        }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (!pulling) return;
        const dy = e.touches[0].pageY - startY;
        if (dy < 0) { pulling = false; return; }

        if (dy > 50 && !indicator) {
            indicator = document.createElement('div');
            indicator.className = 'pull-indicator';
            indicator.textContent = '↓ Loslassen zum Aktualisieren';
            document.body.prepend(indicator);
        }
        if (indicator) {
            const progress = Math.min(dy / 120, 1);
            indicator.style.opacity = progress;
            indicator.textContent = progress >= 1 ? '↻ Loslassen zum Aktualisieren' : '↓ Ziehen zum Aktualisieren';
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (indicator) {
            const shouldRefresh = parseFloat(indicator.style.opacity) >= 1;
            indicator.remove();
            indicator = null;
            if (shouldRefresh) {
                Toast.show('Aktualisiere…', 'info', 1500);
                setTimeout(() => hotReloadConfig(), 300);
            }
        }
        pulling = false;
    });
}

// ---- Hot Config Reload (no page refresh) ------------------------------------
async function hotReloadConfig() {
    // Clear config cache so we get a fresh copy
    CacheManager.clear('portal_config');
    CacheManager.clear('rss_cache_');

    const config = await loadConfig();
    if (!config) {
        Toast.show('Konfiguration konnte nicht geladen werden', 'error', 4000);
        return;
    }

    applySiteConfig(config);
    renderMessage(config.message);
    await renderLinks(config.categories);
    await loadRSSFeed(config.rss_feed, config.rss_items || 5);
    renderDevBadge();
    startAutoRefresh();

    // Reload plugins
    if (typeof PluginManager !== 'undefined') {
        await PluginManager.reloadAll();
    }

    Toast.show('Portal aktualisiert ✓', 'success', 2000);
}

// ---- Apply Site Config ------------------------------------------------------
function applySiteConfig(config) {
    const siteName = config.site_name || 'Portal';
    document.title = siteName;
    document.getElementById('site-name').textContent = siteName;

    const logoEl = document.getElementById('site-logo');
    if (config.logo) {
        logoEl.src = config.logo;
        logoEl.alt = siteName;
        logoEl.classList.remove('hidden');
    }

    if (config.favicon) {
        document.getElementById('favicon').href = config.favicon;
    }
}

// ---- Accessibility: live announcements for screen readers -------------------
function announce(message) {
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 100);
}

// ---- Initialisation ---------------------------------------------------------
async function init() {
    initTheme();
    initDateTime();
    initPullToRefresh();

    const config = await loadConfig();

    if (!config) {
        document.getElementById('links-container').innerHTML = '<p class="error">Failed to load configuration</p>';
        return;
    }

    applySiteConfig(config);
    renderMessage(config.message);
    renderDevBadge();
    await renderLinks(config.categories);
    await loadRSSFeed(config.rss_feed, config.rss_items || 5);
    startAutoRefresh();

    // Phase 3: analytics + admin
    if (typeof initAnalyticsTracking === 'function') initAnalyticsTracking();
    if (typeof renderAdminButton === 'function') renderAdminButton();

    // Phase 4: load plugins
    if (typeof PluginManager !== 'undefined') {
        await PluginManager.loadAll(config.plugins);
    }

    announce('Portal geladen');
}

document.addEventListener('DOMContentLoaded', init);
