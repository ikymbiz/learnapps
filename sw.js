const CACHE_NAME = 'learning-hub-v3';
const STATIC_ASSETS = [
  './index.html',
  './config.json',
  './apps.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg'
];

// Install: cache static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for apps.json, cache-first for others
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isAppsJson = url.pathname.endsWith('apps.json') || url.pathname.endsWith('config.json');

  if (isAppsJson) {
    // Network-first so updates to apps.json are always reflected
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for everything else
    event.respondWith(
      caches.match(event.request).then(res => res || fetch(event.request))
    );
  }
});
