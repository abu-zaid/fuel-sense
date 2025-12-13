// Polyfill for requestIdleCallback
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  (window as any).requestIdleCallback = function (cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };
}

export async function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in this browser');
    return;
  }

  // Register service worker asynchronously without blocking
  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      registerSW();
    }, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(registerSW, 100);
  }
}

async function registerSW() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('Service Worker registered successfully');

    // Register for periodic background sync
    if ('periodicSync' in registration) {
      try {
        await (registration as any).periodicSync.register('sync-offline-data', {
          minInterval: 12 * 60 * 60 * 1000, // 12 hours
        });
        console.log('Periodic background sync registered');
      } catch (err) {
        console.log('Periodic background sync registration failed:', err);
      }
    }

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('New service worker available. Refresh to update.');
            
            // Optionally show update notification
            if (window.confirm('New version available! Reload to update?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    // Check for updates less frequently to reduce overhead
    const updateInterval = setInterval(() => {
      if (registration && registration.update) {
        registration.update().catch(err => {
          console.warn('Service Worker update check failed:', err);
        });
      }
    }, 300000); // Check every 5 minutes

    // Clean up interval on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval);
      });
    }

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, can prompt user to reload
            console.log('New service worker available');
          }
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    // Don't throw - app should work without SW
  }
}
