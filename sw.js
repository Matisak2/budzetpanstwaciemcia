/* Budżet M&W – service worker: the app opens without internet.
   App files (index.html, style.css, js/*): network first (so updates arrive together), cached copy when offline.
   Firebase SDK (versioned URLs) and fonts: cache first. Firestore/Auth traffic is never touched. */
const CACHE = 'budzet-mw-v20';
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
const SHELL = ['./', './index.html', './style.css', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png',
  './js/app.js', './js/util.js', './js/data.js', './js/art.js', './js/logic.js', './js/charts.js', './js/cats.js', './js/guide.js', './js/pay.js', './js/inv.js'];
const SDK_FILES = ['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(f => SDK + f);

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })));
    await Promise.all(SDK_FILES.map(u => c.add(new Request(u, { mode: 'cors' })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

/* same-origin files: the page itself is stored under ./index.html so any start URL opens offline */
async function networkFirst(req, key) {
  const c = await caches.open(CACHE);
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 4000);
    const res = await fetch(req, { signal: ctl.signal, cache: 'no-cache' });
    clearTimeout(t);
    if (res.ok) await c.put(key, res.clone());
    return res;
  } catch (err) {
    return (await c.match(key, { ignoreSearch: true })) || (key === './index.html' && await c.match('./')) || Response.error();
  }
}

async function cacheFirst(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) await c.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname))) {
    e.respondWith(networkFirst(req, './index.html'));
  } else if (url.origin === location.origin) {
    e.respondWith(networkFirst(req, req));
  } else if (url.href.startsWith(SDK) || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req));
  }
});
