// Checklist RV-10: con internet carica sempre la versione più recente, senza rete usa la copia salvata
const CACHE = "rv10-checklist-v8";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => fetch(f, {cache: "reload"}).then(r => { if (r.ok) return c.put(f, r); }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, {cache: "no-cache"}).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || caches.match("./") || caches.match("index.html")))
  );
});
