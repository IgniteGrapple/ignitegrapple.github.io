// IgniteGrapple – offline page service worker

importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js");

const CACHE = "ignitegrapple-offline-v1";

// This is the page that shows when the user is offline
const offlineFallbackPage = "/offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.add(offlineFallbackPage);
    })
  );
});

// Enable navigation preload if the browser supports it
if (workbox.navigationPreload && workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // If the browser preloaded the page, use that
          const preloadResp = await event.preloadResponse;
          if (preloadResp) {
            return preloadResp;
          }

          // Try normal network request
          const networkResp = await fetch(event.request);
          return networkResp;
        } catch (error) {
          // If network fails, show offline fallback
          const cache = await caches.open(CACHE);
          const cachedResp = await cache.match(offlineFallbackPage);
          return cachedResp;
        }
      })()
    );
  }
});
