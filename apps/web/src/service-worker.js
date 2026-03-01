// ============================================================================
// SERVICE WORKER - Cache Strategy for SvelteKit App
// ============================================================================
// This service worker implements a stale-while-revalidate strategy that:
// 1. Serves immutable assets from cache immediately (hashed filenames)
// 2. Always checks for HTML updates to prevent stale app shell
// 3. Automatically cleans up old caches on activation
// 4. Handles offline scenarios gracefully
// ============================================================================

import { build, files, version } from "$service-worker";

const CACHE_NAME = `locanote-cache-${version}`;

// Only cache immutable assets (hashed files) and critical static files
// DO NOT cache HTML files - they should always be fresh
const IMMUTABLE_ASSETS = [...build];
const STATIC_FILES = [...files].filter(
  (file) =>
    !file.endsWith(".html") &&
    !file.includes("service-worker") &&
    !file.endsWith("version.json"),
);

// Assets to cache during install
const ASSETS_TO_CACHE = [...IMMUTABLE_ASSETS, ...STATIC_FILES];

// ============================================================================
// INSTALL: Pre-cache immutable assets
// ============================================================================
self.addEventListener("install", (event) => {
  console.log(`[SW] Installing version: ${version}`);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW] Caching ${ASSETS_TO_CACHE.length} assets`);
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Skip waiting to activate immediately
        // console.log("[SW] Installation complete, skipping wait");
        return self.skipWaiting();
      })
      .catch((error) => {
        // console.error("[SW] Failed to cache assets:", error);
      }),
  );
});

// ============================================================================
// ACTIVATE: Clean up old caches and take control
// ============================================================================
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating version: ${version}`);

  event.waitUntil(
    caches
      .keys()
      .then(async (cacheNames) => {
        // Delete all caches except current
        const deletePromises = cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        });
        return Promise.all(deletePromises);
      })
      .then(() => {
        // Take control of all clients immediately
        // console.log("[SW] Claiming clients");
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients about the update
        return self.clients.matchAll({ type: "window" }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_ACTIVATED",
              version: version,
            });
          });
        });
      }),
  );
});

// ============================================================================
// FETCH: Handle network requests
// ============================================================================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip non-same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip WebSocket requests
  if (url.protocol.startsWith("ws")) return;

  // Skip API/Signaling requests
  if (url.pathname.startsWith("/api/")) return;

  // Route-specific handling
  event.respondWith(routeRequest(event.request, url));
});

// ============================================================================
// Route-specific request handling
// ============================================================================
async function routeRequest(request, url) {
  const pathname = url.pathname;

  // -------------------------------------------------------------------------
  // 1. IMMUTABLE ASSETS (/_app/immutable/*)
  // Cache-first strategy: These have hashed filenames, safe to cache forever
  // -------------------------------------------------------------------------
  if (pathname.startsWith("/_app/immutable/")) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      // console.error("[SW] Failed to fetch immutable asset:", pathname);
      return new Response("Asset not available offline", { status: 503 });
    }
  }

  // -------------------------------------------------------------------------
  // 2. HTML PAGES (including root /)
  // Network-first strategy: Always try network first to get latest app shell
  // This prevents stale HTML referencing old hashed assets
  // -------------------------------------------------------------------------
  if (
    pathname === "/" ||
    pathname.endsWith(".html") ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    try {
      // Try network first
      const networkResponse = await fetch(request);

      if (networkResponse.ok) {
        // Update cache with fresh HTML
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }

      throw new Error("Network response not OK");
    } catch (error) {
      // Network failed, try cache as fallback
      const cached = await caches.match(request);
      if (cached) {
        // console.log("[SW] Serving cached HTML (offline):", pathname);
        return cached;
      }

      // Complete offline - serve root app shell for SPA routing
      // console.log("[SW] Serving app shell for offline SPA routing");
      const rootCache = await caches.match("/");
      if (rootCache) {
        return rootCache;
      }

      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Offline</title></head>
          <body>
            <h1>You are offline</h1>
            <p>Please check your internet connection and try again.</p>
          </body>
        </html>
      `,
        {
          status: 503,
          headers: { "Content-Type": "text/html" },
        },
      );
    }
  }

  // -------------------------------------------------------------------------
  // 3. STATIC ASSETS (favicon, manifest, etc.)
  // Stale-while-revalidate: Serve from cache, update in background
  // -------------------------------------------------------------------------
  const cached = await caches.match(request);

  // Start network fetch in background
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);

  // Return cached version immediately if available
  if (cached) {
    return cached;
  }

  // Wait for network if not in cache
  const networkResponse = await networkFetch;
  if (networkResponse) {
    return networkResponse;
  }

  // Nothing available
  return new Response("Resource not available offline", { status: 503 });
}

// ============================================================================
// MESSAGE HANDLING: Listen for client messages
// ============================================================================
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    // console.log("[SW] Skip waiting message received");
    self.skipWaiting();
  }

  if (event.data?.type === "GET_VERSION") {
    event.ports[0]?.postMessage({ version: version });
  }
});
