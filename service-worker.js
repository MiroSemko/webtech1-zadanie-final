const filesToCache = [
    './',
    './index.html',
    './game.js',
    './favicon512.png',
    './favicon.png',
    './cha-ching.mp3',
    './failure.mp3',
    './success-fanfare.mp3',
    './HelveticaNowText-Medium.ttf',
    './settings.json',
    './style.css',
];

self.addEventListener('install', event => {
    console.log('Installed');
    event.waitUntil(
        caches.open("static").then(cache => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});