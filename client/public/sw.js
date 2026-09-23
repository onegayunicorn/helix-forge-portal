const CACHE_NAME = "helix-forge-shell-v1";
const APP_SHELL = ["/", "/manifest.json", "/icon.svg"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const clone = response.clone();
    if (event.request.url.startsWith(self.location.origin)) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
    return response;
  }).catch(() => caches.match("/"))));
});
