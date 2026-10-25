// =============================================================================
// Portal Page – Privacy-Friendly Analytics (Phase 3)
// =============================================================================
// All data stays in localStorage. Nothing is sent to any server.
// Enable via features.analytics_enabled: true in links.yaml

const Analytics = {
    STORAGE_KEY: 'portal_analytics',

    _enabled() {
        return typeof globalConfig !== 'undefined' && globalConfig?.features?.analytics_enabled === true;
    },

    _load() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || this._empty();
        } catch { return this._empty(); }
    },

    _save(data) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); } catch {}
    },

    _empty() {
        return { clicks: {}, visits: [], searchTerms: {}, created: Date.now() };
    },

    // ---- Track Events -------------------------------------------------------

    trackClick(title, url, category) {
        if (!this._enabled()) return;
        const data = this._load();
        const key = `${category}::${title}`;
        if (!data.clicks[key]) {
            data.clicks[key] = { title, url, category, count: 0, first: Date.now(), last: 0 };
        }
        data.clicks[key].count++;
        data.clicks[key].last = Date.now();
        this._save(data);
    },

    trackVisit() {
        if (!this._enabled()) return;
        const data = this._load();
        const today = new Date().toISOString().slice(0, 10);
        const last = data.visits[data.visits.length - 1];
        if (last?.date === today) {
            last.count++;
        } else {
            data.visits.push({ date: today, count: 1 });
            // Keep max 90 days
            if (data.visits.length > 90) data.visits = data.visits.slice(-90);
        }
        this._save(data);
    },

    trackSearch(term) {
        if (!this._enabled()) return;
        if (!term || term.length < 2) return;
        const data = this._load();
        const key = term.toLowerCase().trim();
        data.searchTerms[key] = (data.searchTerms[key] || 0) + 1;
        // Keep top 100 terms only
        const entries = Object.entries(data.searchTerms).sort((a, b) => b[1] - a[1]).slice(0, 100);
        data.searchTerms = Object.fromEntries(entries);
        this._save(data);
    },

    // ---- Query Data ---------------------------------------------------------

    getTopLinks(limit = 10) {
        const data = this._load();
        return Object.values(data.clicks)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    getTopSearches(limit = 10) {
        const data = this._load();
        return Object.entries(data.searchTerms)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([term, count]) => ({ term, count }));
    },

    getVisitStats() {
        const data = this._load();
        const visits = data.visits;
        const total = visits.reduce((s, v) => s + v.count, 0);
        const days = visits.length;
        return {
            totalVisits: total,
            totalDays: days,
            avgPerDay: days ? (total / days).toFixed(1) : 0,
            last7: visits.slice(-7),
            since: data.created
        };
    },

    getSummary() {
        const top = this.getTopLinks(5);
        const visits = this.getVisitStats();
        const searches = this.getTopSearches(5);
        return { top, visits, searches };
    },

    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// ---- Wire click tracking into link cards ------------------------------------
// Called once after DOM is ready. Uses event delegation on the links container.
function initAnalyticsTracking() {
    if (!Analytics._enabled()) return;

    Analytics.trackVisit();

    // Delegate clicks on link cards
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.link-card');
        if (!card) return;
        const title = card.querySelector('.link-title')?.textContent?.trim() || '';
        const url = card.href || '';
        const category = card.closest('.category')?.querySelector('.category-title')?.textContent?.trim() || '';
        Analytics.trackClick(title, url, category);
    });

    console.log('[Analytics] Tracking initialised (privacy-friendly, localStorage only)');
}
