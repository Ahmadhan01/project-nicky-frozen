const CACHE_NAME = 'nicky-frozen-v1';
const OFFLINE_URLS = [
    '/kasir/dashboard',
    '/kasir/history',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(OFFLINE_URLS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Hanya cache GET request untuk halaman kasir
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Cache halaman kasir dan riwayat
    if (url.pathname === '/kasir/dashboard' || url.pathname === '/kasir/history') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Simpan response ke cache
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Kalau offline, ambil dari cache
                    return caches.match(event.request).then((cached) => {
                        return cached || new Response('Offline', { status: 503 });
                    });
                })
        );
    }
});