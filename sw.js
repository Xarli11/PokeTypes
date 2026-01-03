const CACHE_NAME = 'poketypes-v2.3.3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/src/js/main.js',
  '/src/js/modules/calculator.js',
  '/src/js/modules/data.js',
  '/src/js/modules/ui.js',
  '/data/pokedex.json',
  '/data/type-data.json',
  '/pokeball.png'
];

// Install: Cache files
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation immediately
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
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

// Fetch: Network first for HTML, Cache first for assets (Stale-while-revalidate strategy could be better but sticking to simple cache-first with network fallback for now, or network-first for dev safety)
// Let's stick to the previous simple logic but now with versioning working correctly.
// Actually, for an app like this, Network First for HTML is safer to ensure updates are seen.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found, else fetch from network
      return response || fetch(event.request);
    })
  );
});