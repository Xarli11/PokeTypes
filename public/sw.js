// Kept in sync with package.json's version — bump it on every release so
// stale precaches from prior deploys get cleaned up on activate.
const CACHE_NAME = 'poketypes-v2.37.1';

// Only static assets that are guaranteed to exist as-is under Astro's
// Cloudflare (server output) build. Client scripts (main.js and its
// modules) are bundled and content-hashed at build time — their real
// paths (/_astro/*.js) aren't known ahead of time, so they are never
// precached here; the network-first fetch handler below opportunistically
// caches them (and everything else) as they're requested.
// Precaching the PWA icons alongside the manifest keeps "Add to Home
// Screen" working the moment it's available, even on a flaky connection —
// safe to list here since install (below) never lets one failed asset
// abort the rest.
const ASSETS = [
  '/',
  '/manifest.json',
  '/pokeball.png',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install: cache what we can, but never let a single missing/failed asset
// abort the whole install (cache.addAll is all-or-nothing).
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(ASSETS.map((url) => cache.add(url)));
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network First, falling back to Cache
// This ensures users always get the latest version if they are online.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network fetch is successful, clone it and update the cache
        // verification: check if valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), return from cache
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
