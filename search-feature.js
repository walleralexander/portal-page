// Search functionality for portal links (Phase 2)
// Respects globalConfig.features.search_enabled

function createSearchBar() {
    // Don't create duplicates (important for hot-reload)
    if (document.getElementById('search-input')) return;

    // Respect config
    if (typeof globalConfig !== 'undefined' && globalConfig?.features?.search_enabled === false) return;

    const header = document.querySelector('.header-right');
    if (!header) return;

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'search-input';
    searchInput.placeholder = 'Suche… (Ctrl+K)';
    searchInput.className = 'search-input';
    searchInput.setAttribute('aria-label', 'Links durchsuchen');

    searchContainer.appendChild(searchInput);
    header.insertBefore(searchContainer, header.firstChild);

    let searchDebounce = null;
    searchInput.addEventListener('input', (e) => {
        filterLinks(e.target.value);
        // Track search terms (debounced)
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            if (typeof Analytics !== 'undefined' && e.target.value.length >= 2) {
                Analytics.trackSearch(e.target.value);
            }
        }, 800);
    });

    // Ctrl+K to focus search
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

function filterLinks(searchTerm) {
    const categories = document.querySelectorAll('.category');
    const term = searchTerm.toLowerCase().trim();

    categories.forEach(category => {
        const links = category.querySelectorAll('.link-card');
        let hasVisibleLinks = false;

        links.forEach(link => {
            const titleEl = link.querySelector('.link-title');
            if (!titleEl) return;
            const title = titleEl.textContent.toLowerCase();
            const href  = (link.href || '').toLowerCase();
            const isVisible = term === '' || title.includes(term) || href.includes(term);
            link.style.display = isVisible ? 'flex' : 'none';
            if (isVisible) hasVisibleLinks = true;
        });

        category.style.display = (hasVisibleLinks || term === '') ? 'block' : 'none';
    });

    // Screen-reader announcement
    if (typeof announce === 'function' && term) {
        const visible = document.querySelectorAll('.link-card[style*="flex"], .link-card:not([style])').length;
        announce(`${visible} Ergebnisse für "${searchTerm}"`);
    }
}

// Initialise – use a MutationObserver so it works even after hot-reload
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(createSearchBar, 150);
});
