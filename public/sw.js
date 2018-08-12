self.addEventListener('install', (event) => {
    var urls = [
        '/',
        '/features',
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
        caches.open('servgo-static-v1').then(cache => {
            return cache.addAll(urls);
        })
    )
})


self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(response => {
           if(response) return response;
           return fetch(event.request);
        })
    )
});