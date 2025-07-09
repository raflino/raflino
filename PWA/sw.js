const CACHE_NAME = 'my-pwa-cache-v2'; // Ubah versi cache setiap ada update file cache
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/sw.js',
    '/icons/icon-192x192.png', // Pastikan jalur ikon sesuai
    '/icons/icon-512x512.png', // Pastikan jalur ikon sesuai
    // Tambahkan file CSS atau JS lain jika ada
];

// Event Install: Menginstal Service Worker dan meng-cache aset
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Menginstal...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching shell aset');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Gagal meng-cache aset:', error);
            })
    );
});

// Event Fetch: Menyediakan aset dari cache atau dari jaringan
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Jika aset ditemukan di cache, kembalikan dari cache
                if (response) {
                    console.log(`[Service Worker] Mengambil dari cache: ${event.request.url}`);
                    return response;
                }
                // Jika tidak, ambil dari jaringan
                console.log(`[Service Worker] Mengambil dari jaringan: ${event.request.url}`);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('[Service Worker] Kesalahan fetch:', error);
                // Opsional: Fallback untuk halaman offline
                // return caches.match('/offline.html');
            })
    );
});

// Event Activate: Membersihkan cache lama
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Mengaktifkan dan membersihkan cache lama...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`[Service Worker] Menghapus cache lama: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Cache lama berhasil dibersihkan.');
            return self.clients.claim(); // Penting untuk mengontrol klien segera
        })
    );
});