const cacheName = "progressCache";
const filesToCache = [
    './',
    './index.html',
    './game.js',
    './assets/favicon512.png',
    './assets/favicon.png',
    './assets/cha-ching.mp3',
    './assets/failure.mp3',
    './assets/success-fanfare.mp3',
    './assets/HelveticaNowText-Medium.ttf',
    './settings.json',
    './assets/style.css',
];

self.addEventListener('install', event => {
    console.log('Installed');
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    // console.log("fetched!");
    event.respondWith(
        caches.match(event.request).then(response => {
            // console.log(response);
            return response || fetch(event.request);
        })
    );
});