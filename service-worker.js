// =============================================================================
// Portal Page – Service Worker (Phase 3 PWA)
// =============================================================================
const CACHE_NAME = 'portal-v4';
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

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for YAML/API, cache-first for static
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // YAML config & RSS proxy – always network-first
    if (url.pathname.endsWith('.yaml') || url.hostname === 'api.allorigins.win') {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // Static assets – cache-first
    if (event.request.method === 'GET' && url.origin === self.location.origin) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // Everything else – network only
    event.respondWith(fetch(event.request));
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Offline fallback
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
}

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
