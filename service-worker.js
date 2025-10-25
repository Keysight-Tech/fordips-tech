/**
 * FORDIPS TECH - Service Worker
 * PWA Support with offline caching
 */

const CACHE_NAME = 'fordips-tech-v1.0.0';
const RUNTIME_CACHE = 'fordips-runtime';

// Assets to cache on install (using relative paths for flexibility)
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './config.js',
    './utils.js',
    './translations.js',
    './manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Cache files individually to prevent one failure from blocking all
                return Promise.all(
                    STATIC_ASSETS.map(url => {
                        return cache.add(url).catch(err => {
                            console.warn('Failed to cache:', url, err);
                            // Continue even if one file fails
                            return Promise.resolve();
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('Service worker installation failed:', err);
                self.skipWaiting(); // Skip waiting even if caching fails
            })
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

