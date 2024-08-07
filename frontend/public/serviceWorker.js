/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '/index.html',
    // Add other URLs you want to cache
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});


//
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request); 
            }
        )
    );
});

