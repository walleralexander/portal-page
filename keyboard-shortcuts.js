// Keyboard shortcuts for portal (Phase 2)
document.addEventListener('keydown', (e) => {
    // Ctrl+D – toggle dark mode
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        document.getElementById('theme-toggle').click();
    }

    // Ctrl+Shift+R – hot-reload config (no full page refresh)
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (typeof hotReloadConfig === 'function') {
            hotReloadConfig();
        }
        return;           // don't fall through to Ctrl+R
    }

    // Ctrl+R – normal page refresh
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        location.reload();
    }

    // Ctrl+Shift+C – clear all caches (dev helper)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (typeof CacheManager !== 'undefined') {
            CacheManager.clear();
            if (typeof Toast !== 'undefined') {
                Toast.show('Alle Caches gelöscht', 'info', 2000);
            }
        }
        return;
    }

    // Ctrl+Shift+A – toggle admin panel
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (typeof AdminPanel !== 'undefined') {
            AdminPanel.toggle();
        }
        return;
    }

    // ESC – clear search + close admin
    if (e.key === 'Escape') {
        // Close admin panel first if open
        if (typeof AdminPanel !== 'undefined' && AdminPanel._open) {
            AdminPanel.close();
            return;
        }
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    }

    // Ctrl+Shift+H – show RSS health status (dev helper)
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        if (typeof rssHealthStatus !== 'undefined' && typeof Toast !== 'undefined') {
            const urls = Object.keys(rssHealthStatus);
            if (urls.length === 0) {
                Toast.show('Keine RSS-Health-Daten verfügbar', 'info', 3000);
            } else {
                const lines = urls.map(url => {
                    const h = rssHealthStatus[url];
                    const short = new URL(url).hostname;
                    return `${short}: ${h.ok ? '✓' : '✗'} ${h.avgMs ? Math.round(h.avgMs) + 'ms' : '–'} (${h.fails} fails)`;
                });
                Toast.show(lines.join('\n'), h => h.ok ? 'success' : 'warning', 6000);
            }
        }
    }
});

// Add keyboard shortcut hints
function addKeyboardHints() {
    const toggle = document.getElementById('theme-toggle');
    toggle.title = 'Toggle dark mode (Ctrl+D)';
}

document.addEventListener('DOMContentLoaded', addKeyboardHints);
