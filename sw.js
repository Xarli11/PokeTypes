const CACHE_NAME = 'poketypes-v2.18.6';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/src/js/main.js',
  '/src/js/modules/calculator.js',
  '/src/js/modules/data.js',
  '/src/js/modules/theme.js',
  '/src/js/modules/ui.js',
  '/data/pokedex.json',
  '/data/type-data.json',
  '/pokeball.png',
  '/favicon.ico'
];

// Install: Cache files
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
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
