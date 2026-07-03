const CACHE_NAME = 'nicky-frozen-v2';
const OFFLINE_PAGES = [
    '/kasir/dashboard',
    '/kasir/history',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(OFFLINE_PAGES);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Hapus cache lama
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Lewati request dari ekstensi browser atau skema non-http (tidak bisa di-cache)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // Cache halaman kasir
    const isKasirPage = url.pathname === '/kasir/dashboard' || url.pathname === '/kasir/history';

    // Cache semua asset JS/CSS (chunk React)
    const isAsset = url.pathname.startsWith('/build/') || 
                    url.pathname.endsWith('.js') || 
                    url.pathname.endsWith('.css') ||
                    url.pathname.endsWith('.png') ||
                    url.pathname.endsWith('.jpg') ||
                    url.pathname.endsWith('.ico');

    if (isKasirPage || isAsset) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then((cached) => {
                        return cached || new Response('Offline', { status: 503 });
                    });
                })
        );
    }
});