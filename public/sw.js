const CACHE_NAME = 'mlima-shell-v2';
const SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/Logo_officiel.png',
  '/logo-officiel.svg?v=2',
  '/icons/mlima-192.png?v=2',
  '/icons/mlima-512.png?v=2',
];
const PUBLIC_API_PREFIXES = ['/api/products', '/api/categories', '/api/settings'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('mlima-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isPublicCatalogRequest = PUBLIC_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
  const isPrivateApiRequest = url.pathname.startsWith('/api/') && !isPublicCatalogRequest;
  if (isPrivateApiRequest || url.pathname.startsWith('/api/auth/')) return;

  if (isPublicCatalogRequest) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(request);
        return cached || Response.json({ error: 'Catalogue hors ligne indisponible.' }, { status: 503 });
      }
    })());
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) (await caches.open(CACHE_NAME)).put('/', response.clone());
        return response;
      } catch {
        return (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }

  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
  }
});
