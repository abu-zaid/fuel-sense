const CACHE_NAME = 'fuelsense-v2';
const STATIC_CACHE = 'fuelsense-static-v2';
const RUNTIME_CACHE = 'fuelsense-runtime-v2';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Cache strategies
const isStaticAsset = (url) => {
  return url.includes('/_next/static/') || 
         url.includes('/icon-') || 
         url.includes('/manifest.json') ||
         url === '/' ||
         url.match(/\.(js|css|woff|woff2|png|jpg|jpeg|svg|ico)$/);
};

const isApiRequest = (url) => {
  return url.includes('supabase.co') || url.includes('/api/');
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache install error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and same-origin check
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    // For API requests, use network only
    if (isApiRequest(url.href)) {
      return;
    }
  }

  // Cache-first strategy for static assets (fastest)
  if (isStaticAsset(url.href)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for HTML pages (fast initial load, update in background)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Network-first with cache fallback for other resources
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
