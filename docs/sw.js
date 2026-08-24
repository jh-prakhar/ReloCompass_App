/**
 * ReloCompass Service Worker
 * - Navigation + API: network-first (fresh data), offline fallback for shell pages
 * - Static assets (css/js/icons): stale-while-revalidate
 * - Never caches: /api/auth (tokens), POST/PATCH/DELETE responses
 */
const VERSION = 'v1';
const SHELL_CACHE = `relocompass-shell-${VERSION}`;
const STATIC_CACHE = `relocompass-static-${VERSION}`;

const SHELL_PAGES = [
  './',
  './index.html',
  './login.html',
  './register.html',
  './dashboard.html',
  './assistant.html',
  './jobs.html',
  './employers.html',
  './about.html',
  './contact.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_PAGES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // never intercept mutations

  const url = new URL(request.url);

  // Same-origin API GETs (jobs list, chat history): network-first, no fallback cache
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    if (url.pathname.startsWith('/api/auth')) return; // let auth hit network directly
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ detail: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Navigation (HTML): network-first, fall back to cached shell page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
            .then((hit) => hit || caches.match('./index.html'))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (
    url.origin === self.location.origin &&
    /\.(css|js|png|svg|ico|webp|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
