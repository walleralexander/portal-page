// =============================================================================
// Portal Page – Service Worker (Phase 3 PWA)
// =============================================================================
const CACHE_NAME = 'portal-v10';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/enhancements.css',
    '/admin.css',
    '/app.js',
    '/analytics.js',
    '/admin.js',
    '/plugins/plugins.js',
    '/keyboard-shortcuts.js',
    '/search-feature.js',
    '/offline.html'
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[SW] Some assets failed to cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches. War vorher eine alte Version aktiv, offene Tabs
// einmal neu laden, damit sie nicht mit veraltetem HTML/JS weiterlaufen.
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate');
    event.waitUntil((async () => {
        const old = (await caches.keys()).filter(k => k !== CACHE_NAME);
        await Promise.all(old.map(k => caches.delete(k)));
        await self.clients.claim();
        if (old.length) {
            const tabs = await self.clients.matchAll({ type: 'window' });
            tabs.forEach(tab => tab.navigate(tab.url));
        }
    })());
});

// Fetch: network-first fuer alles Eigene, Cache nur als Offline-Fallback.
// (Cache-first hielt Besucher nach jedem Deploy auf alten Dateien fest.)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (event.request.method === 'GET' &&
        (url.origin === self.location.origin || url.hostname === 'api.allorigins.win')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Everything else – network only
    event.respondWith(fetch(event.request));
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
}
