// =============================================================================
// Portal Page – Admin Panel (Phase 3)
// =============================================================================
// Open with Ctrl+Shift+A or the ⚙ button in the header.
// Provides: analytics dashboard, cache management, config viewer, RSS health.

const AdminPanel = {
    _open: false,
    _el: null,

    toggle() {
        this._open ? this.close() : this.open();
    },

    open() {
        if (this._open) return;
        this._open = true;
        this._render();
        document.body.classList.add('admin-open');
        // trap focus
        setTimeout(() => this._el?.querySelector('.admin-tab-btn')?.focus(), 100);
    },

    close() {
        if (!this._open) return;
        this._open = false;
        document.body.classList.remove('admin-open');
        if (this._el) { this._el.remove(); this._el = null; }
    },

    _render() {
        // Remove old
        document.getElementById('admin-panel')?.remove();

        const panel = document.createElement('div');
        panel.id = 'admin-panel';
        panel.className = 'admin-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Admin Panel');

        panel.innerHTML = `
            <div class="admin-header">
                <h2 class="admin-title">⚙ Admin Panel</h2>
                <button class="admin-close" aria-label="Schließen">&times;</button>
            </div>
            <div class="admin-tabs">
                <button class="admin-tab-btn active" data-tab="analytics">📊 Statistik</button>
                <button class="admin-tab-btn" data-tab="cache">💾 Cache</button>
                <button class="admin-tab-btn" data-tab="rss">📡 RSS Health</button>
                <button class="admin-tab-btn" data-tab="config">📝 Config</button>
                ${(this._pluginTabs || []).map(t =>
                    `<button class="admin-tab-btn" data-tab="plugin-${t.name}">${t.label}</button>`
                ).join('')}
            </div>
            <div class="admin-body">
                <div class="admin-tab-content" id="admin-tab-analytics"></div>
                <div class="admin-tab-content hidden" id="admin-tab-cache"></div>
                <div class="admin-tab-content hidden" id="admin-tab-rss"></div>
                <div class="admin-tab-content hidden" id="admin-tab-config"></div>
                ${(this._pluginTabs || []).map(t =>
                    `<div class="admin-tab-content hidden" id="admin-tab-plugin-${t.name}"></div>`
                ).join('')}
            </div>
        `;

        document.body.appendChild(panel);
        this._el = panel;

        // Events
        panel.querySelector('.admin-close').onclick = () => this.close();
        panel.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.onclick = () => this._switchTab(btn.dataset.tab);
        });

        // Backdrop click closes
        panel.addEventListener('click', (e) => {
            if (e.target === panel) this.close();
        });

        // Render first tab
        this._renderAnalytics();
        this._renderCache();
        this._renderRSSHealth();
        this._renderConfig();

        // Render plugin tabs
        (this._pluginTabs || []).forEach(t => {
            const tabEl = panel.querySelector(`#admin-tab-plugin-${t.name}`);
            if (tabEl && t.render) t.render(tabEl);
        });
    },

    _switchTab(tabName) {
        if (!this._el) return;
        this._el.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        this._el.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        this._el.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
        this._el.querySelector(`#admin-tab-${tabName}`)?.classList.remove('hidden');
    },

    // ---- Analytics Tab -------------------------------------------------------
    _renderAnalytics() {
        const container = this._el.querySelector('#admin-tab-analytics');
        if (!Analytics._enabled()) {
            container.innerHTML = `
                <div class="admin-empty">
                    <p>📊 Analytics ist deaktiviert.</p>
                    <p class="admin-hint">Aktiviere <code>features.analytics_enabled: true</code> in der Konfiguration.</p>
                </div>`;
            return;
        }

        const summary = Analytics.getSummary();
        const visits = summary.visits;

        // Visit stats
        let html = `<div class="admin-section">
            <h3>Besuche</h3>
            <div class="admin-stat-grid">
                <div class="admin-stat"><span class="admin-stat-value">${visits.totalVisits}</span><span class="admin-stat-label">Gesamt</span></div>
                <div class="admin-stat"><span class="admin-stat-value">${visits.totalDays}</span><span class="admin-stat-label">Tage</span></div>
                <div class="admin-stat"><span class="admin-stat-value">${visits.avgPerDay}</span><span class="admin-stat-label">⌀/Tag</span></div>
            </div>`;

        // Mini bar chart for last 7 days
        if (visits.last7.length > 0) {
            const max = Math.max(...visits.last7.map(v => v.count), 1);
            html += `<div class="admin-chart">`;
            visits.last7.forEach(v => {
                const pct = (v.count / max * 100).toFixed(0);
                const day = v.date.slice(5); // MM-DD
                html += `<div class="admin-bar-col" title="${v.date}: ${v.count} Besuche">
                    <div class="admin-bar" style="height:${pct}%"></div>
                    <span class="admin-bar-label">${day}</span>
                </div>`;
            });
            html += `</div>`;
        }
        html += `</div>`;

        // Top links
        html += `<div class="admin-section"><h3>Beliebte Links</h3>`;
        if (summary.top.length === 0) {
            html += `<p class="admin-hint">Noch keine Klicks erfasst.</p>`;
        } else {
            html += `<table class="admin-table"><tr><th>Link</th><th>Kategorie</th><th>Klicks</th></tr>`;
            summary.top.forEach(l => {
                html += `<tr><td>${escHTML(l.title)}</td><td>${escHTML(l.category)}</td><td>${l.count}</td></tr>`;
            });
            html += `</table>`;
        }
        html += `</div>`;

        // Top searches
        html += `<div class="admin-section"><h3>Häufige Suchen</h3>`;
        if (summary.searches.length === 0) {
            html += `<p class="admin-hint">Noch keine Suchen erfasst.</p>`;
        } else {
            html += `<div class="admin-tag-list">`;
            summary.searches.forEach(s => {
                html += `<span class="admin-tag">${escHTML(s.term)} <small>(${s.count})</small></span>`;
            });
            html += `</div>`;
        }
        html += `</div>`;

        // Reset button
        html += `<div class="admin-section">
            <button class="admin-btn admin-btn-danger" id="admin-reset-analytics">Alle Analytics-Daten löschen</button>
        </div>`;

        container.innerHTML = html;

        container.querySelector('#admin-reset-analytics')?.addEventListener('click', () => {
            if (confirm('Alle Analytics-Daten wirklich löschen?')) {
                Analytics.reset();
                Toast.show('Analytics-Daten gelöscht', 'info', 2000);
                this._renderAnalytics();
            }
        });
    },

    // ---- Cache Tab -----------------------------------------------------------
    _renderCache() {
        const container = this._el.querySelector('#admin-tab-cache');
        const c = globalConfig?.cache;

        let html = `<div class="admin-section"><h3>Cache-Status</h3>`;
        html += `<div class="admin-stat-grid">
            <div class="admin-stat">
                <span class="admin-stat-value">${c?.enabled === false ? '❌' : '✅'}</span>
                <span class="admin-stat-label">Master</span>
            </div>
            <div class="admin-stat">
                <span class="admin-stat-value">${c?.rss_enabled === false ? '❌' : `${c?.rss_duration || 300}s`}</span>
                <span class="admin-stat-label">RSS</span>
            </div>
            <div class="admin-stat">
                <span class="admin-stat-value">${c?.config_enabled === false ? '❌' : `${c?.config_duration || 60}s`}</span>
                <span class="admin-stat-label">Config</span>
            </div>
        </div></div>`;

        // List cached items
        const cached = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('rss_cache_') || key === 'portal_config') {
                try {
                    const val = JSON.parse(localStorage.getItem(key));
                    const age = ((Date.now() - val.timestamp) / 1000).toFixed(0);
                    const size = (localStorage.getItem(key).length / 1024).toFixed(1);
                    cached.push({ key: key.replace('rss_cache_', ''), age: `${age}s`, size: `${size}KB` });
                } catch {}
            }
        }

        html += `<div class="admin-section"><h3>Gespeicherte Einträge (${cached.length})</h3>`;
        if (cached.length === 0) {
            html += `<p class="admin-hint">Kein Cache vorhanden.</p>`;
        } else {
            html += `<table class="admin-table"><tr><th>Schlüssel</th><th>Alter</th><th>Größe</th></tr>`;
            cached.forEach(c => {
                const shortKey = c.key.length > 40 ? c.key.slice(0, 37) + '…' : c.key;
                html += `<tr><td title="${escHTML(c.key)}">${escHTML(shortKey)}</td><td>${c.age}</td><td>${c.size}</td></tr>`;
            });
            html += `</table>`;
        }
        html += `</div>`;

        html += `<div class="admin-section admin-btn-row">
            <button class="admin-btn" id="admin-clear-rss">RSS Cache löschen</button>
            <button class="admin-btn" id="admin-clear-config">Config Cache löschen</button>
            <button class="admin-btn admin-btn-danger" id="admin-clear-all">Alles löschen</button>
        </div>`;

        container.innerHTML = html;

        container.querySelector('#admin-clear-rss')?.addEventListener('click', () => {
            CacheManager.clear('rss_cache_');
            Toast.show('RSS-Cache gelöscht', 'info', 2000);
            this._renderCache();
        });
        container.querySelector('#admin-clear-config')?.addEventListener('click', () => {
            CacheManager.clear('portal_config');
            Toast.show('Config-Cache gelöscht', 'info', 2000);
            this._renderCache();
        });
        container.querySelector('#admin-clear-all')?.addEventListener('click', () => {
            CacheManager.clear('rss_cache_');
            CacheManager.clear('portal_config');
            Toast.show('Alle Caches gelöscht', 'info', 2000);
            this._renderCache();
        });
    },

    // ---- RSS Health Tab ------------------------------------------------------
    _renderRSSHealth() {
        const container = this._el.querySelector('#admin-tab-rss');
        const urls = Object.keys(rssHealthStatus);

        if (urls.length === 0) {
            container.innerHTML = `<div class="admin-empty"><p>Noch keine RSS-Feed-Daten.</p>
                <p class="admin-hint">Lade die Seite und warte, bis RSS-Feeds geladen sind.</p></div>`;
            return;
        }

        let html = `<div class="admin-section"><h3>Feed-Status</h3>
            <table class="admin-table">
            <tr><th>Feed</th><th>Status</th><th>⌀ ms</th><th>Fehler</th><th>Letzter Abruf</th></tr>`;

        urls.forEach(url => {
            const h = rssHealthStatus[url];
            let host;
            try { host = new URL(url).hostname; } catch { host = url; }
            const ago = h.lastLoad ? ((Date.now() - h.lastLoad) / 1000).toFixed(0) + 's' : '–';
            html += `<tr>
                <td title="${escHTML(url)}">${escHTML(host)}</td>
                <td>${h.ok ? '<span class="admin-badge-ok">✓ OK</span>' : '<span class="admin-badge-err">✗ Fehler</span>'}</td>
                <td>${h.avgMs ? Math.round(h.avgMs) : '–'}</td>
                <td>${h.fails}</td>
                <td>${ago} ago</td>
            </tr>`;
        });

        html += `</table></div>`;

        html += `<div class="admin-section">
            <button class="admin-btn" id="admin-refresh-rss">Alle Feeds neu laden</button>
        </div>`;

        container.innerHTML = html;

        container.querySelector('#admin-refresh-rss')?.addEventListener('click', () => {
            if (typeof hotReloadConfig === 'function') {
                hotReloadConfig();
                Toast.show('Feeds werden neu geladen…', 'info', 2000);
                setTimeout(() => this._renderRSSHealth(), 5000);
            }
        });
    },

    // ---- Config Tab ----------------------------------------------------------
    _renderConfig() {
        const container = this._el.querySelector('#admin-tab-config');
        if (!globalConfig) {
            container.innerHTML = `<div class="admin-empty"><p>Keine Konfiguration geladen.</p></div>`;
            return;
        }

        // Show read-only formatted config
        const configDisplay = {
            site_name: globalConfig.site_name,
            message: globalConfig.message,
            rss_feed: globalConfig.rss_feed,
            rss_items: globalConfig.rss_items,
            rss_refresh_interval: globalConfig.rss_refresh_interval,
            request_timeout: globalConfig.request_timeout,
            max_retries: globalConfig.max_retries,
            cache: globalConfig.cache,
            features: globalConfig.features,
            categories: globalConfig.categories?.map(c => ({
                name: c.name,
                links: c.links?.length || 0,
                rss_feed: c.rss_feed || null
            }))
        };

        let html = `<div class="admin-section"><h3>Aktuelle Konfiguration</h3>
            <pre class="admin-config-pre">${escHTML(JSON.stringify(configDisplay, null, 2))}</pre>
        </div>`;

        // Validation
        const result = ConfigValidator.validate(globalConfig);
        html += `<div class="admin-section"><h3>Validierung</h3>`;
        if (result.ok && result.warnings.length === 0) {
            html += `<p class="admin-badge-ok">✓ Konfiguration ist gültig</p>`;
        } else {
            result.errors.forEach(e => { html += `<p class="admin-badge-err">✗ ${escHTML(e)}</p>`; });
            result.warnings.forEach(w => { html += `<p class="admin-badge-warn">⚠ ${escHTML(w)}</p>`; });
        }
        html += `</div>`;

        html += `<div class="admin-section admin-btn-row">
            <button class="admin-btn" id="admin-reload-config">Config neu laden</button>
            <button class="admin-btn" id="admin-export-config">Config exportieren</button>
        </div>`;

        container.innerHTML = html;

        container.querySelector('#admin-reload-config')?.addEventListener('click', () => {
            if (typeof hotReloadConfig === 'function') {
                hotReloadConfig();
                setTimeout(() => this._renderConfig(), 2000);
            }
        });

        container.querySelector('#admin-export-config')?.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(globalConfig, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'portal-config.json'; a.click();
            URL.revokeObjectURL(url);
            Toast.show('Konfiguration exportiert', 'success', 2000);
        });
    }
};

// Helper
function escHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- Admin toggle button in header ------------------------------------------
function renderAdminButton() {
    if (document.getElementById('admin-toggle-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'admin-toggle-btn';
    btn.className = 'admin-toggle-btn';
    btn.setAttribute('aria-label', 'Admin Panel öffnen (Ctrl+Shift+A)');
    btn.title = 'Admin Panel (Ctrl+Shift+A)';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10.08 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
    btn.onclick = () => AdminPanel.toggle();

    const headerRight = document.querySelector('.header-right');
    if (headerRight) headerRight.appendChild(btn);
}
