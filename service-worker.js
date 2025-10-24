/**
 * FORDIPS TECH - Service Worker
 * PWA Support with offline caching
 */

const CACHE_NAME = 'fordips-tech-v1.0.0';
const RUNTIME_CACHE = 'fordips-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
    '/fordips-tech/',
    '/fordips-tech/index.html',
    '/fordips-tech/styles.css',
    '/fordips-tech/enhanced-product-styles.css',
    '/fordips-tech/enhanced-checkout-styles.css',
    '/fordips-tech/currency-styles.css',
    '/fordips-tech/config.js',
    '/fordips-tech/utils.js',
    '/fordips-tech/script.js',
    '/fordips-tech/cart.js',
    '/fordips-tech/products.js',
    '/fordips-tech/supabase-integration.js',
    '/fordips-tech/translations.js',
    '/fordips-tech/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Supabase API calls (always fetch fresh)
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Cache-first strategy for static assets
    if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
        event.respondWith(
            caches.match(request)
                .then((response) => response || fetch(request))
        );
        return;
    }

    // Network-first strategy for everything else
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone the response
                const responseToCache = response.clone();

                // Cache successful responses
                if (response.status === 200) {
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }

                return response;
            })
            .catch(() => {
                // Fallback to cache on network failure
                return caches.match(request);
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker: Registered');
