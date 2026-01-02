const CACHE_NAME = 'poketypes-v1';
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
