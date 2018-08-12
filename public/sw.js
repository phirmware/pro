var staticCache = 'servgo-static-v2';

self.addEventListener('install', (event) => {
    var urls = [
        '/',
        '/features',
        '/pricing',
        '/login',
        '/services',
        '/signup',
        '/assets/images/logos/bulkit-logo-g.png',
        '/assets/images/logos/bulkit-green.svg',
        '/assets/images/logos/bulkit-white.svg',
        '/assets/css/app.css',
        '/assets/css/bulma.css',
        '/assets/css/core_green.css',
        '/assets/css/main.css',
        '/assets/js/app.js',
        '/assets/js/auth.js',
        '/assets/js/landingv1.js',
        '/assets/js/main.js'
    ];

    event.waitUntil(
        caches.open(staticCache).then(cache => {
            return cache.addAll(urls);
        })
    )
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => {
                    return cache.startsWith('servgo') && cache != staticCache;
                }).map(cacheName => {
                    return caches.delete(cacheName)
                })
            )
        })
    )
});


self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            return fetch(event.request);
        })
    )
});