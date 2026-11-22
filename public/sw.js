const CACHE_NAME = 'mlima-shell-v3';
const SHELL_URLS = [
  '/',
  '/manifest.webmanifest',
  '/offline.html',
  '/logo-officiel.svg',
  '/icons/mlima-192.png',
  '/icons/mlima-512.png',
];
const ASSET_TIMEOUT_MS = 3500;

async function cacheResponse(cache, request, response) {
  const cacheControl = response.headers.get('Cache-Control') || '';
  if (
    response.ok &&
    response.type === 'basic' &&
    !/\b(?:private|no-store)\b/i.test(cacheControl) &&
    response.headers.get('Vary') !== '*'
  ) {
    try {
      await cache.put(request, response.clone());
    } catch (error) {
      console.warn('MLIMA could not update a cached resource:', error);
    }
  }
  return response;
}

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ASSET_TIMEOUT_MS);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL_URLS);

    const shell = await cache.match('/');
    if (!shell) throw new Error('MLIMA app shell was not precached.');

    const entrypointAssets = [...shellTextAssets(await shell.text())];
    if (entrypointAssets.length > 0) await cache.addAll(entrypointAssets);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('mlima-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function* shellTextAssets(html) {
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const asset = new URL(match[1], self.location.origin);
    if (asset.origin === self.location.origin && asset.pathname.startsWith('/assets/')) {
      yield asset.href;
    }
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetchWithTimeout(request);
        if (response.ok && response.headers.get('Content-Type')?.includes('text/html')) {
          await cacheResponse(await caches.open(CACHE_NAME), '/', response);
        }
        return response;
      } catch {
        return (await caches.match('/')) || (await caches.match('/offline.html')) || Response.error();
      }
    })());
    return;
  }

  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        return await cacheResponse(cache, request, await fetchWithTimeout(request));
      } catch {
        return (await cache.match(request)) || Response.error();
      }
    })());
  }
});
