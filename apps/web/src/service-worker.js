// ============================================================================
// SERVICE WORKER
// ============================================================================
// This service worker enables offline functionality for Locanote.
// It uses SvelteKit's built-in asset tracking for comprehensive caching.

import { build, files, version } from "$service-worker";

const CACHE_NAME = `locanote-cache-${version}`;

// Combine all assets to cache
const ASSETS = [
  ...build, // The app's built JS and CSS
  ...files, // Static assets (favicon, manifest, etc.)
  "/", // The root page
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      // Delete old caches
      for (const key of keys) {
        if (key !== CACHE_NAME) await caches.delete(key);
      }
      // Take control immediately
      self.clients.claim();
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. Only handle requests from the same origin
  if (url.origin !== self.location.origin) return;

  // 2. Skip WebSocket and signaling server
  if (url.protocol.startsWith("ws")) return;

  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      if (cacheResponse) return cacheResponse;

      // 3. Fallback to network if not in cache
      return fetch(event.request).catch(() => {
        // 4. CRITICAL: If offline and requesting an HTML page (like a deep link),
        // serve the root app shell ('/') so the client-side router can take over.
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/");
        }
        return new Response("Offline and resource not found", { status: 503 });
      });
    }),
  );
});
