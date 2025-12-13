// This version is auto-generated during build
const VERSION = '1.0.1765663660802';
const CACHE_NAME = `fuelsense-v${VERSION}`;
const STATIC_CACHE = `fuelsense-static-v${VERSION}`;
const RUNTIME_CACHE = `fuelsense-runtime-v${VERSION}`;
const DATA_CACHE = `fuelsense-data-v${VERSION}`;
const OFFLINE_QUEUE = `fuelsense-offline-queue-v${VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
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

const isDataRequest = (url) => {
  return url.includes('/rest/v1/');
};

// Offline queue management
let offlineQueue = [];

const saveOfflineRequest = async (request) => {
  const queue = await getOfflineQueue();
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now(),
  };
  queue.push(requestData);
  await saveQueue(queue);
};

const getOfflineQueue = async () => {
  try {
    const cache = await caches.open(OFFLINE_QUEUE);
    const response = await cache.match('queue');
    if (response) {
      return await response.json();
    }
  } catch (err) {
    console.log('Error getting offline queue:', err);
  }
  return [];
};

const saveQueue = async (queue) => {
  try {
    const cache = await caches.open(OFFLINE_QUEUE);
    await cache.put('queue', new Response(JSON.stringify(queue)));
  } catch (err) {
    console.log('Error saving queue:', err);
  }
};

const syncOfflineData = async () => {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return;

  const remainingQueue = [];
  
  for (const requestData of queue) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });
      
      if (!response.ok) {
        remainingQueue.push(requestData);
      } else {
        // Notify clients about successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              data: requestData,
            });
          });
        });
      }
    } catch (err) {
      remainingQueue.push(requestData);
    }
  }
  
  await saveQueue(remainingQueue);
};

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker version:', VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache install error:', err);
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker version:', VERSION);
  event.waitUntil(
    Promise.all([
      // Delete ALL caches to force fresh start
      caches.keys().then((cacheNames) => {
        console.log('[SW] Clearing all caches for clean slate');
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      syncOfflineData(), // Sync any offline data when SW activates
    ])
  );
  // Take control of all pages immediately
  self.clients.claim();
  
  // Notify all clients about the update
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: VERSION,
      });
    });
  });
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle non-GET requests (POST, PUT, DELETE)
  if (request.method !== 'GET') {
    if (isApiRequest(url.href)) {
      event.respondWith(
        fetch(request.clone())
          .then(response => response)
          .catch(async () => {
            // Save to offline queue if network fails
            await saveOfflineRequest(request.clone());
            
            // Notify client about offline save
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'OFFLINE_SAVE',
                  message: 'Data saved offline. Will sync when online.',
                });
              });
            });
            
            return new Response(
              JSON.stringify({ 
                offline: true, 
                message: 'Saved offline. Will sync when connection is restored.' 
              }),
              { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          })
      );
    }
    return;
  }

  // Handle GET requests
  if (url.origin !== self.location.origin) {
    // For API GET requests, use network-first with cache fallback
    if (isApiRequest(url.href) && isDataRequest(url.href)) {
      event.respondWith(
        fetch(request)
          .then(response => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(DATA_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request).then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response(
                JSON.stringify({ offline: true, data: [] }),
                { 
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
          })
      );
      return;
    }
  }

  // For _next chunks and static files, use network-first to avoid serving stale/incompatible code
  if (url.pathname.includes('/_next/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache at all for chunks to prevent version mismatch
          return response;
        })
        .catch(() => {
          // If network fails, try cache as last resort
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for other static assets (fastest)
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

  // Network-first for HTML pages to always get latest version
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // If network fails, try cache as fallback
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cache, return offline page
          return caches.match('/offline.html').then(offlinePage => {
            return offlinePage || new Response('Offline', { status: 503 });
          });
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SYNC_NOW') {
    syncOfflineData();
  }
});

// Periodic background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Listen for online event
self.addEventListener('online', () => {
  syncOfflineData();
  
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'ONLINE',
        message: 'Connection restored. Syncing data...',
      });
    });
  });
});
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

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }
});
