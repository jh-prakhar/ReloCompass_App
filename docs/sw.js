/**
 * ReloCompass Service Worker
 * - Navigation + API: network-first (fresh data), offline fallback for shell pages
 * - Static assets (css/js/icons): stale-while-revalidate
 * - Offline page for uncached navigations
 * - Background-sync apply queue: POST /jobs/{id}/apply replayed when back online
 * - Never caches: /api/auth (tokens), POST/PATCH/DELETE responses (except queued applies)
 */
const VERSION = 'v4';
const SHELL_CACHE = `relocompass-shell-${VERSION}`;
const STATIC_CACHE = `relocompass-static-${VERSION}`;
const PENDING_DBS = 'relocompass-pending-applies';

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
  './community.html',
  './visa-checklist.html',
  './reset-password.html',
  './offline.html',
  './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(SHELL_PAGES.map((p) => cache.add(p)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== STATIC_CACHE && k !== PENDING_DBS + '-store')
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Background sync: queued job applications ────────────────────────────────
// Queue entries are stored as JSON envelopes so the replay can rebuild the
// ORIGINAL headers (Authorization included — init headers replace the list).
async function getDb() {
  return await caches.open(PENDING_DBS + '-store');
}

function envelopeKey(url) {
  return 'https://apply-queue/' + encodeURIComponent(url);
}

async function enqueueApply(request) {
  const body = await request.clone().text();
  const auth = request.headers.get('Authorization') || '';
  const cache = await getDb();
  const env = JSON.stringify({ url: request.url, body, auth });
  await cache.put(envelopeKey(request.url), new Response(env));
  if (self.registration.sync) {
    try { await self.registration.sync.register('relocompass-apply-queue'); } catch (e2) {}
  }
  notifyClients({ type: 'apply-queued', url: request.url });
}

async function replayApplies() {
  const cache = await getDb();
  const keys = await cache.keys();
  for (const key of keys) {
    const stored = await cache.match(key);
    if (!stored) continue;
    try {
      const env = JSON.parse(await stored.text());
      const headers = { 'Content-Type': 'application/json' };
      if (env.auth) headers['Authorization'] = env.auth;
      const res = await fetch(env.url, { method: 'POST', headers, body: env.body });
      if (res.ok || res.status === 409) {
        // 409 = already applied (previous attempt succeeded server-side)
        await cache.delete(key);
        notifyClients({ type: 'apply-synced', url: env.url, status: res.status });
      }
    } catch (e) {
      // still offline — keep queued
    }
  }
}

function notifyClients(msg) {
  self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((c) => c.postMessage(msg));
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'relocompass-apply-queue') {
    event.waitUntil(replayApplies());
  }
});

// Allow the page to trigger a replay immediately (no BackgroundSync in Safari;
// main.js also posts this message on window 'online')
self.addEventListener('message', (event) => {
  if (event.data === 'relocompass:replay-applies') {
    replayApplies();
  }
});

// Reconnect event for service workers (fires when the device regains network)
self.addEventListener('online', () => replayApplies());

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Job applications while offline: queue for background sync instead of failing
  if (request.method === 'POST' && /\/api\/jobs\/\d+\/apply\/?$/.test(new URL(request.url).pathname + '/')) {
    event.respondWith(handleOfflineApply(event));
    return;
  }

  if (request.method !== 'GET') return; // never intercept other mutations

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

  // Navigation (HTML): network-first, fall back to cached shell page, then offline.html
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
            .then(
              (hit) =>
                hit ||
                caches
                  .match('./index.html')
                  .then((idx) => idx || caches.match('./offline.html'))
            )
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

async function handleOfflineApply(event) {
  try {
    return await fetch(event.request);
  } catch (e) {
    // Queue the original request (headers included) for background replay
    await enqueueApply(event.request);
    return new Response(JSON.stringify({ queued: true, detail: 'Saved offline — will send when you reconnect.' }), {
      status: 202,
      headers: { 'Content-Type': 'application/json', 'X-Relocompass-Queued': '1' },
    });
  }
}
