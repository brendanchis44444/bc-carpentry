// Offline support: keeps the app and its libraries on the device so it opens with no signal.
// Firebase handles its own offline data; this only caches the app files.
const CACHE = "bcj-ad5703ed76";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "favicon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"];
const CDN = ["cdnjs.cloudflare.com", "www.gstatic.com", "cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com", "tessdata.projectnaptha.com"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // app files: try the network first so updates arrive, fall back to the copy on the device
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else if (CDN.includes(url.hostname) && !url.pathname.includes("__/auth")) {
    // libraries and fonts never change at a pinned version: use the saved copy
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); } return res; })));
  }
});
