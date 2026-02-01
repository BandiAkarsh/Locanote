// ============================================================================
// SERVICE WORKER
// ============================================================================
// This service worker enables offline functionality for Locanote.
// It caches static assets and implements a cache-first strategy.
//
// CACHING STRATEGY:
// - Static assets (JS, CSS, HTML): Cache-first, fallback to network
// - API calls: Network-first, fallback to cache (for offline editing)
// - IndexedDB: Not cached by SW (handled by y-indexeddb directly)
//
// VERSIONING:
// - Update CACHE_NAME when deploying new versions
// - This forces the service worker to update cached assets
// ============================================================================

const CACHE_NAME = 'locanote-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg'
];

// ============================================================================
// INSTALL EVENT
// ============================================================================
// Fired when the service worker is first installed.
// We cache the core static assets needed for the app shell.

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error);
      })
  );
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================
// Fired when the service worker takes control.
// We clean up old caches from previous versions.

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// ============================================================================
// FETCH EVENT
// ============================================================================
// Fired for every network request made by the app.
// We implement different strategies based on the request type.

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests (we don't cache POST/PUT/DELETE)
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip WebSocket connections (signaling server)
  if (url.protocol === 'wss:' || url.protocol === 'ws:') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Strategy: Cache-first for static assets
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
  }
  // Strategy: Network-first for HTML pages (for updates)
  else if (isHtmlPage(request)) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Default: Network-only (don't cache API calls)
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.woff', '.woff2'];
  return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

function isHtmlPage(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

// Cache-first: Try cache first, fall back to network
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached version and update cache in background
    fetchAndCache(request, cache);
    return cached;
  }
  
  // Not in cache, fetch from network
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Network fetch failed:', error);
    // Return offline fallback if available
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first: Try network first, fall back to cache
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Update cache with fresh version
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page if available
    const offlinePage = await cache.match('/');
    if (offlinePage) {
      return offlinePage;
    }
    
    return new Response('You are offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Fetch and cache in background (stale-while-revalidate pattern)
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (error) {
    // Ignore background fetch errors
  }
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================
// Listen for messages from the main app

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================================
// SYNC EVENT (Background Sync)
// ============================================================================
// Handle background sync for offline changes

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

async function syncNotes() {
  console.log('[SW] Background sync triggered');
  // Notify all clients that sync is happening
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      timestamp: Date.now()
    });
  });
}

// ============================================================================
// PUSH EVENT (Push Notifications)
// ============================================================================
// Handle push notifications (future feature)

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Locanote', {
      body: data.body ?? 'New activity',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag ?? 'default',
      requireInteraction: false
    })
  );
});

// ============================================================================
// NOTIFICATION CLICK
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow('/app')
  );
});

console.log('[SW] Service worker loaded');
