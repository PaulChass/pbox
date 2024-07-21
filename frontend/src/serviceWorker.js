import axios from 'axios';
const CACHE_NAME = 'version-3';
const urlsToCache = [    'offline.html' ];

// Install SW
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Listen for requests
self.addEventListener('fetch', async (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(async () => {
                try {
                    const axiosResponse = await axios.get(event.request.url);
                    return new Response(JSON.stringify(axiosResponse.data), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } catch (error) {
                    return caches.match('offline.html');
                }
            })
    );
});

// Activate the SW
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(CACHE_NAME);

    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if(!cacheWhitelist.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        ))
    );
});