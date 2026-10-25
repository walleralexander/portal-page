// Selbstzerstoerer: frueher registrierte Service Worker (Cache-first, portal-v6 ff.)
// loeschen ihre Caches, melden sich ab und laden offene Tabs frisch vom Server.
// Bleibt liegen, solange noch alte Registrierungen im Umlauf sein koennen.
// Hintergrund: /stacks/vmcv-cal/POSTMORTEM.md (keine PWA).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        await self.registration.unregister();
        const tabs = await self.clients.matchAll({ type: 'window' });
        tabs.forEach(tab => tab.navigate(tab.url));
    })());
});
