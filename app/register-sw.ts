export async function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!navigator.serviceWorker) {
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

    // Check for updates less frequently to reduce overhead
    setInterval(() => {
      registration.update();
    }, 300000); // Check every 5 minutes instead of every minute

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
  }
}
